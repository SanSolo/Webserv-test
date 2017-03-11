var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const lodash = require('lodash');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const Issue = require('../models/issue');

/**
 * @api {get} /users Liste des utilisateurs
 * @apiName RetrieveUsers1
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Affiche la liste des utilisateurs triée par nom de famille (par ordre alphabétique). Affiche un décompte du nombre d'issues créées par user
 *
 * @apiUse UsersInResponseBody

 *
 *
 * @apiExample Example
 *     GET /users
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: https://heigvd-webserv-2017-team-3.herokuapp.com/users
 *
 *     [
 *       {
 *        "id": "58b2926f5e1def0579e97bc0",
 *        "firstName": "John",
 *        "lastName": "Doe",
 *        "role": "citizen",
 *        "createdAt": "2017-01-01T14:31:87.000Z",
 *        "createdIssuesCount": 2
 *       },
 *       {
 *        "id": "58b58b9240e6e957f8f1a146",
 *        "firstName": "Jean",
 *        "lastName": "Dujardin",
 *        "role": "citizen",
 *        "createdAt": "2017-02-04T10:27:65.000Z"
 *       }
 *     ]
 */
 /*
 Liste tous les utilisateurs avec un compte du nombre d'issues créées.
 Si aucune issues créée alors la propriété issuesCount reste vide
 */
 router.get('/', function(req, res, next) {
   // Recherche tous les utilisateurs ordrés par nom de famille
   User.find().sort('lastName').exec(function(err, users) {
      if (err) {
        return next(err);
      }
      const usersIds = users.map(user => user._id);
      Issue.aggregate([
      {
        $match: { // Sélectionne les issues créées par les users qui nous intéressent
          createdBy: { $in: usersIds }
        }
      },
      {
        $group: { // Groupe les documents par ID de user
            _id: '$createdBy',
            issuesCount: { // Compte le nombre d'issues créées pour cet ID de user
              $sum: 1
            }
        }
      }
    ], function(err, results) {
        if (err) {
          return next(err);
        }
        // Convetit les documents User en JSON
        const userJson = users.map(user => user.toJSON());
        console.log(userJson);

        // Pour chaque résultat...
        results.forEach(function(result) {
          // Prend l'id User (Qui était utilisé pour $group)
          const resultId = result._id.toString();
          // Trouve le User correspondant...
          const correspondingPerson = userJson.find(user => user._id == resultId);
          // Et attache la nouvelle propriété
          correspondingPerson.createdIssuesCount = result.issuesCount;
        });
        // Send the enriched response
        res.send(userJson);
      });

    });
 });

 /**
  * @api {get} /users/:id Renvoi un utilisateur
  * @apiName RetrieveUsers2
  * @apiGroup Utilisateur
  * @apiVersion 1.0.0
  * @apiDescription Renvoi un utilisateur
  *
  * @apiUse UsersIdInUrlPath
  * @apiUse UsersInResponseBody
  * @apiUse UsersNotFoundError
  *
  * @apiExample Example
  *     GET /users/58b2926f5e1def0123e97bc0 HTTP/1.1
  *
  * @apiSuccessExample 200 OK
  *     HTTP/1.1 200 OK
  *     Content-Type: application/json
  *     Link: https://heigvd-webserv-2017-team-3.herokuapp.com/users/58b2926f5e1def0123e97bc0
  *     {
  *       "id": "58b2926f5e1def0123e97bc0",
  *       "firstName": "John",
  *       "lastName": "Doe",
  *       "role": "citizen",
  *       "createdAt": "2017-01-01T14:31:87.000Z"
  *     }
  */

/* Retourne les informations d'un User spécifique */
router.get('/:id', loadUserFromParamsMiddleware, function(req, res, next){
  res.send(req.user);
});

/**
 * @api {get} /users/:id/createdIssues Renvoi les problèmes (issues) créés par un utilisateur
 * @apiName RetrieveIssuesUsers
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Renvoi les problèmes créés par un utilisateur
 *
 * @apiUse UsersIdInUrlPath
 * @apiUse UsersInResponseBody
 * @apiUse UsersNotFoundError
 *
 * @apiExample Example
 *     GET /users/58b2926f5e1def0789e5678/createdIssues HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     [
 *     {
 *       "id": "58b2926f5e1def0789e5678",
 *       "title": "Poubelles renversées",
 *       "description": "Ordures sur la route",
 *       "latitude": 48.517,
 *       "longitude": 12.628,
 *       "createdBy": "58b96d537690d41bff3b7ff3",
 *       "__v": 0,
 *       "createdAt": "2017-03-03T13:56:29.164Z",
 *       "tags": [
 *          "poubelles",
 *          "sale",
 *          "moche"
 *        ],
 *        "status":"new",
 *     }
 *     ]
 */

/* Retourne les Issues créées par un User spécifique */
router.get('/:id/createdIssues', loadIssuesFromUser, function(req, res, next){
  res.send(req.issues);
});

 /**
  * @api {post} /users Création de l'utilisateur
  * @apiName CreateUser
  * @apiGroup Utilisateur
  * @apiVersion 1.0.0
  * @apiDescription Enregistrer un nouvel utilisateur.
  *
  * @apiUse UsersInRequestBody
  * @apiUse UsersInResponseBody
  * @apiUse UsersValidationError
  *
  * @apiExample Example
  *     POST /users HTTP/1.1
  *     Content-Type: application/json
  *
  *     {
  *       "firstName": "John",
  *       "lastName": "Doe",
  *       "role": "citizen",
  *     }
  *
  * @apiSuccessExample 201 Created
  *     HTTP/1.1 201 Created
  *     Content-Type: application/json
  *     Location: https://heigvd-webserv-2017-team-3.herokuapp.com/users
  *
  *     {
 *        "id": "58b2926f5e1def0579e97bc0",
 *        "firstName": "John",
 *        "lastName": "Doe",
 *        "role": "citizen",
 *        "createdAt": "2017-01-01T14:31:87.000Z"
  *     }
  */

router.post('/', function(req, res, next) {
  console.log(req.body);
  new User(req.body).save(function(err, savedUser) {
    if (err) {
      console.log(err);
      return next(err);
    }
    console.log(savedUser);

    res.send(savedUser);
  });
});

/**
 * @api {patch} /users/:id Apporter une modification partielle sur un utilisateur
 * @apiName PartiallyUpdateUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Apporter une modification partielle sur les données d'un utilisateur (seuls les propriétés déjà existantes peuvent être modifiées).
 * Toutes les propriétés sont optionnelles
 *
 * @apiUse UsersIdInUrlPath
 * @apiUse UsersInRequestBody
 * @apiUse UsersInResponseBody
 * @apiUse UsersNotFoundError
 * @apiUse UsersValidationError
 *
 * @apiExample Example
 *     PATCH /users/58b2926f5e1def0789e97bc0 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *        "firstName": "Johnny",
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "id": "58b2926f5e1def0579e97bc0",
 *       "firstName": "Johnny",
 *       "lastName": "Doe",
 *       "role": "citizen",
 *       "createdAt": "2017-01-01T14:31:87.000Z"
 *     }
 */

router.patch('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
  const whitelist = lodash.pick(req.body, ['firstName', 'lastName', 'role']); //crée une whitelist de propriétés pouvant être changées
  // Remplace automatiquement les valeurs faisant partie de la whiteliste dans le nouvel User
  lodash.assignIn(req.user, whitelist);
  // Enregistrement du nouvel User
  req.user.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    res.send(savedUser);
  });
});

/**
 * @api {put} /users/:id Mettre à jour les données d'un utilisateur
 * @apiName UpdateUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Remplace les données d'un utilisateur (Les données de l'utilisateur doivent être complètes et valides).
 *
 * @apiUse UsersIdInUrlPath
 * @apiUse UsersInRequestBody
 * @apiUse UsersInResponseBody
 * @apiUse UsersNotFoundError
 * @apiUse UsersValidationError
 *
 * @apiExample Example
 *     PUT /users/58b2926f5e1def0789e97bc0 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *        "firstName": "Danny",
 *        "lastName": "Mendes",
 *        "role": "manager",
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *        "id": "58b2926f5e1def0579e97bc0",
 *        "firstName": "Danny",
 *        "lastName": "Mendes",
 *        "role": "manager",
 *        "createdAt": "2017-01-01T14:31:87.000Z"
 *     }
 */

router.put('/:id', loadUserFromParamsMiddleware, function(req, res, next) {

  // Update all properties (regardless of whether they are in the request body or not)
  req.user.firstName = req.body.firstName;
  req.user.lastName = req.body.lastName;
  req.user.role = req.body.role;

  req.user.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    res.send(savedUser);
  });
});

/**
 * @api {delete} /users/:id Supprimer un utilisateur
 * @apiName DeleteUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Supprimer définitivement les données utilisateurs
 *
 * @apiUse UsersIdInUrlPath
 * @apiUse UsersNotFoundError
 *
 * @apiExample Example
 *     DELETE /users/58b2926f5e1def0789e97bc0 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */

/*router.delete('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        return next(err);
      }

      res.sendStatus(204);
    });
  });*/

  /**
   * Middleware qui charge les utilisateurs correspond à l'ID dans l'URL.
   * Renvoi une erreur 404 Not Found, si l'ID n'est pas valide ou si l'utilisateur n'existe pas.
   */

function loadUserFromParamsMiddleware(req, res, next) {

  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }

  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return userNotFound(res, userId);
    }

    req.user = user;
    next();
  });
}
/**
* Middleware qui charge les isssues d'un User dont l'id est fourni dans l'URL
*/
function loadIssuesFromUser (req, res, next) {
  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }
  Issue.find({'createdBy': userId}, function (err, issues){
    if (err){
      return next(err);
    }else if (!issues) {
      return issueNotFound(res, userId);
    }
    req.issues = issues;
    next();
  });
}

/**
 * Renvoi une erreur 404 Not Found et un message indicant que l'utilisateur avec l'ID spécifié n'a pas été trouvé.
 */

function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}

/**
 * @apiDefine UsersIdInUrlPath
 * @apiParam (URL path parameters) {String} id L'identifiant, qui est unique, définit un utilisateur.
 */

/**
 * @apiDefine UsersInRequestBody
 * @apiParam (Request body) {String{2..20}} firstName Le prénom de l'utilisateur (la combinaison du prénom et du nom doit être unique)
 * @apiParam (Request body) {String{2..20}} lastName Le nom de famille de l'utilisateur (la combinaison du prénom et du nom doit être unique)
 * @apiParam (Request body) {String="citizen","manager"} role Définit le rôle de l'utilisateur
 */

/**
 * @apiDefine UsersInResponseBody
 * @apiSuccess (Response body) {String} id L'identifiant, qui est unique, définit un utilisateur.
 * @apiSuccess (Response body) {String} firstName Le prénom de l'utilisateur
 * @apiSuccess (Response body) {String} lastName Le nom de famille de l'utilisateur
 * @apiSuccess (Response body) {String} role Définit le rôle de l'utilisateur
 * @apiSuccess (Response body) {Date} createdAt La date de création du compte utilisateur (ajout automatique)


 */

/**
 * @apiDefine UsersNotFoundError
 *
 * @apiError {Object} 404/NotFound Pas d'utilisateur trouvé
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     Aucun utilisateur n a l identifiant : 58b2926f5e1def0123e97bc0
 */

/**
 * @apiDefine UsersValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Certaines propriétés de l'utilisateurs sont invalides
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 {
   "message": "User validation failed",
   "errors": {
     "firstName": {
       "message": "Path `firstName` (`J`) is shorter than the minimum allowed length (2).",
       "name": "ValidatorError",
       "properties": {
         "minlength": 2,
         "type": "minlength",
         "message": "Path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length (2).",
         "path": "firstName",
         "value": "J"
       },
       "kind": "minlength",
       "path": "firstName",
       "value": "J"
     }
   }
 }
 */

module.exports = router;

var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const lodash = require('lodash');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const Issue = require('../models/issue');


/* GET specific User */
/**
 * @api {get} /users/:id Liste des utilisateurs
 * @apiName RetrieveUsers1
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Affiche la liste des utilisateurs triée par nom de famille (par ordre alphabétique)
 *
 * @apiUse UsersInResponseBody

 *
 *
 * @apiExample Example
 *     GET /users?role=citizen&page=2&pageSize=50 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://evening-meadow-25867.herokuapp.com/users?page=1&pageSize=50&gt;; rel="first prev"
 *
 *     [
 *       {
 *        "id": "58b2926f5e1def0579e97bc0",
 *        "firstName": "John",
 *        "lastName": "Doe",
 *        "role": "citizen",
 *        "createdAt": "2017-01-01T14:31:87.000Z"
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

 /* GET users listing. */
 /*router.get('/', function(req, res, next) {
   User.find().sort('lastName').exec(function(err, users) {
      if (err) {
        return next(err);
      }
      res.send(users);
    });
 });*/
 /* GET users listing. */
 router.get('/', function(req, res, next) {
   User.find().sort('lastName').exec(function(err, users) {
      if (err) {
        return next(err);
      }
      const usersIds = users.map(user => user._id);
      Issue.aggregate([
      {
        $match: { // Select movies directed by the people we are interested in
          createdBy: { $in: usersIds }
        }
      },
      {
        $group: { // Group the documents by director ID
            _id: '$createdBy',
            issuesCount: { // Count the number of movies for that ID
              $sum: 1
            }
        }
      }
    ], function(err, results) {
        if (err) {
          return next(err);
        }
        // Convert the Person documents to JSON
        const userJson = users.map(user => user.toJSON());
        console.log(userJson);

        // For each result...
        results.forEach(function(result) {
          // Get the director ID (that was used to $group)...
          const resultId = result._id.toString();
          // Find the corresponding person...
          const correspondingPerson = userJson.find(user => user._id == resultId);
          // And attach the new property
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
  *
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
 * @api {get} /users/:id Renvoi les problèmes créés par un utilisateur
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
 *     GET /issues?user=58b2926f5e1def0123e97bc0&page=2&pageSize=50 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     [
 *     {
         "id": "58b2926f5e1def0789e5678",
         "status":"new",
         "description": "essai 2",
         "imageUrl": "http://hvdseigneuries.com/wp-content/uploads/2009/02/trouverchatonrect-fb-56e15ff28c6fc.jpg",
         "latitude": "-30",
         "longitude": "150",
         "tags": "chaton"
         "createdAt": "2017-02-28T14:39:14.588Z",
         "createdBy": "users/58b2926f5e1def0123e97bc0"
 *     },
         "id": "58b2926f5e1def0789e97281",
         "status":"new",
         "description": "Dupo",
         "imageUrl": "http://hvdseigneuries.com/wp-content/uploads/2009/02/trouverchatonrect-fb-56e15ff28c6fc.jpg",
         "latitude": "-10",
         "longitude": "10",
         "tags": "hiboux"
         "createdAt": "2017-02-28T14:39:14.588Z",
         "createdBy": "users/58b2926f5e1def0123e97bc0"
        *     }

 *     ]
 */


/* Retourne les Issues créées par un User spécifique */
router.get('/:id/createdIssues', loadIssuesFromUser, function(req, res, next){
  res.send(req.issues);
});

 /**
  * @api {post} /users/:id Création de l'utilisateur
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
  *     Location: https://evening-meadow-25867.herokuapp.com/users/58b2926f5e1def0579e97bc0
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
 * @api {patch} /users/:id Apporter une modification partielle sur les données utilisateurs
 * @apiName PartiallyUpdateUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Apporter une modification partielle sur les données utilisateurs (seuls les propriétés déjà existantes peuvent être modifiées).
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
 * @api {put} /users/:id Mettre à jour les données utilisateur
 * @apiName UpdateUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Remplace les données des personnes (Les données de l'utilisateur doivent être complètes et valides).
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
 * @apiSuccess (Response body) {String} [id] L'identifiant, qui est unique, définit un utilisateur.
 * @apiSuccess (Response body) {String} firstName Le prénom de l'utilisateur
 * @apiSuccess (Response body) {String} lastName Le nom de famille de l'utilisateur
 * @apiSuccess (Response body) {String} role Définit le rôle de l'utilisateur
 * @apiSuccess (Response body) {Date} [createdAt] La date de création du compte utilisateur (ajout automatique)


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

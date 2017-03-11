var express = require('express');
var router = express.Router();
// Load the full build.
const lodash = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Issue = require('../models/issue');
const User = require('../models/user');


//début commentaire
/**
 * @api {get} /issues Liste des problèmes
 * @apiName RetrieveIssues1
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Renvoi une liste de problèmes triée par date de création (de la plus vieille à la récente pour traiter les vieux problèmes en premier)
 * Permet également de paginer la liste
 * @apiUse IssueInResponseBody
 * @apiParam (URL query parameters) {String} [status] Sélectionne seulement les issues ayant le status spécifié
 * @apiExample Example
 *     GET /issues?status=new
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://heigvd-webserv-2017-team-3.herokuapp.com/issues?page=1&pageSize=50&gt;; rel="first prev"
 *
 *     [
 *     {
         "id": "58b2926f5e1def0789e5678",
         "title": "test",
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
         "title": "essai",
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

 // GET /issues
 router.get('/', function(req, res, next) {
   Issue.find().count(function(err, total) {
     if (err) { return next(err); };
     let query = Issue.find();
     console.log(total);
     // Parse the "page" param (default to 1 if invalid)
     let page = parseInt(req.query.page, 10);
     if (isNaN(page) || page < 1) { /* ... */ }
     // Parse the "pageSize" param (default to 100 if invalid)
     let pageSize = parseInt(req.query.pageSize, 10);
     if (isNaN(pageSize) || pageSize < 0 || pageSize > 100) { /* ... */ }
     // Apply skip and limit to select the correct page of elements
     query = query.skip((page - 1) * pageSize).limit(pageSize);
     res.set('Pagination-Page', page);
     res.set('Pagination-PageSize', pageSize);
     res.set('Pagination-Total', total);

     // Filter by status
     if (req.query.status && req.query.status != "") {
       query = query.where('status').equals(req.query.status);
     }
     // Execute the query
     query.exec(function(err, issues) {
       if (err) {
         return next(err);
       }
       res.send(issues);
     });
   });
 });

/**
 * @api {get} /issues/:id Renvoi un problème
 * @apiName RetrieveIssues2
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Renvoi un problème
 *
 * @apiUse IssueIdInUrlPath
 * @apiUse IssueInResponseBody
 * @apiUse IssueNotFoundError
 *
 * @apiExample Example
 *     GET /issues/58b2926f5e1def0789e97281 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
       "id": "58b2926f5e1def0789e97281",
       "status":"new",
       "description": "Dupo",
       "imageUrl": "http://hvdseigneuries.com/wp-content/uploads/2009/02/trouverchatonrect-fb-56e15ff28c6fc.jpg",
       "latitude": "-10",
       "longitude": "10",
       "tags": "hiboux"
       "createdAt": "2017-02-28T14:39:14.588Z",
       "createdBy": "users/58b573bbfb211b515d79b831"
 *     }
 */

/* GET specific Issue */
router.get('/:id', loadIssueFromParamsMiddleware, function(req, res, next){
  res.send(req.issue);
});



/**
 * @api {post} /issues Créer un problème
 * @apiName CreateIssues
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Enregistrer un nouveau problème
 *
 * @apiUse IssueInRequestBody
 * @apiUse IssueInResponseBody
 * @apiUse IssueValidationError
 *
 * @apiExample Example
 *     POST /issues HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
         "title":"test",
	       "status":"new",
	       "description": "Dupo",
	       "imageUrl": "http://hvdseigneuries.com/wp-content/uploads/2009/02/trouverchatonrect-fb-56e15ff28c6fc.jpg",
	       "latitude": "-10",
	       "longitude": "10",
	       "tags": "hiboux"
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://heigvd-webserv-2017-team-3.herokuapp.com/issues
 *
 *     {

         "__v": 0,
         "title": "essai",
         "status": "new",
         "description": "Dupo",
         "imageUrl": "http://hvdseigneuries.com/wp-content/uploads/2009/02/trouverchatonrect-fb-56e15ff28c6fc.jpg",
         "latitude": -10,
         "longitude": 10,
         "_id": "58b58b9240e6e957f8f1a146",
         "createdAt": "2017-02-28T14:39:14.588Z",
         "tags": [
           "hiboux"
         ]
 *     }
 */

router.post('/', function(req, res, next) {
  console.log(req.body);
  new Issue(req.body).save(function(err, savedIssue) {
    if (err) {
      console.log(err);
      return next(err);
    }
    console.log(savedIssue);


    res.send(savedIssue);
  });
});

/**
 * @api {patch} /issues/:id Mettre à jour un problème partiellement
 * @apiName PartiallyUpdateIssues
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Mise à jour partielle d une donnée de problème (Seul les propriétés déjà existantes seront mise-à-jour)
 * Toutes les propriétés sont optionnelles
 *
 * @apiUse IssueIdInUrlPath
 * @apiUse IssueInRequestBody
 * @apiUse IssueInResponseBody
 * @apiUse IssueNotFoundError
 * @apiUse IssueValidationError
 *
 * @apiExample Example
 *     PATCH /issues/58b2926f5e1def0123e97281 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "description": "description de "
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
         "__v": 0,
         "title": "test",
         "status": "new",
         "description": "description de",
         "imageUrl": "citizen",
         "latitude": -10,
         "longitude": 10,
         "_id": "58b2926f5e1def0123e97281",
         "createdAt": "2017-02-28T14:39:14.588Z",
         "tags": [
           "hiboux"
         ]
 *     }
 */

router.patch('/:id', loadIssueFromParamsMiddleware, function(req, res, next) {
  const whitelist = lodash.pick(req.body, ['status', 'description', 'imageUrl', 'latitude', 'longitude', 'updatedAt','tags']); //create a whitelist of properties to be changed
  lodash.assignIn(req.issue, whitelist);
  req.issue.updatedAt = Date.now();

  req.issue.save(function(err, savedIssue) {
    if (err) {
      return next(err);
    }
    res.send(savedIssue);
  });
});


/**
 * @api {put} /issues/:id Mise à jour d'un problème
 * @apiName UpdateIssue
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Remplace les données des problèmes (cette requête doit avec les paramètres complets et être valides)
 *
 * @apiUse IssueIdInUrlPath
 * @apiUse IssueInRequestBody
 * @apiUse IssueInResponseBody
 * @apiUse IssueNotFoundError
 * @apiUse IssueValidationError
 *
 * @apiExample Example
 *     PUT /issues/58b2926f5e1def0123e97bc0 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
           "title": "hola",
           "imageUrl": "http://i.skyrock.net/8034/92018034/pics/3238631469_1_3_x5cYkxeV.jpg",
           "latitude": 12,
           "longitude": 150,
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
           "title": "hola",
           "__v": 0,
           "status": "new",
           "description": "description de",
           "imageUrl": "http://i.skyrock.net/8034/92018034/pics/3238631469_1_3_x5cYkxeV.jpg",
           "latitude": 12,
           "longitude": 150,
           "_id": "58b2926f5e1def0123e97bc0",
           "createdAt": "2017-02-28T14:39:14.588Z",
           "tags": [
             "hiboux"
           ]
 *     }
 */

router.put('/:id', loadIssueFromParamsMiddleware, function(req, res, next) {

  // Update all properties (regardless of whether they are in the request body or not)
  req.issue.status = req.body.status;
  req.issue.description = req.body.description;
  req.issue.imageUrl = req.body.imageUrl;
  req.issue.latitude = req.body.latitude;
  req.issue.longitude = req.body.longitude;
  req.issue.tags = req.body.tags;
  req.updatedAt = Date.now();

  req.issue.save(function(err, savedIssue) {
    if (err) {
      return next(err);
    }
    res.send(savedIssue);
  });
});

/**
 * @api {delete} /issues/:id Supprimer un problème
 * @apiName DeleteIssue
 * @apiGroup Probleme
 * @apiVersion 1.0.0
 * @apiDescription Supprime définitivement le problème
 *
 * @apiUse IssueIdInUrlPath
 * @apiUse IssueNotFoundError
 *
 * @apiExample Example
 *     DELETE /issues/58b2926f5e1def0123e97bc0 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */

router.delete('/:id', loadIssueFromParamsMiddleware, function(req, res, next) {
  req.issue.remove(function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  });
});


/**
 * Middleware qui charge les problèmes correspondant à l'ID de l'URL
 * Renvoi une erreur 404 Not Found si l'ID n'est pas valide ou s'il n'existe pas
 */

function loadIssueFromParamsMiddleware(req, res, next) {

  const issueId = req.params.id;
  if (!ObjectId.isValid(issueId)) {
    return issueNotFound(res, issueId);
  }

  Issue.findById(req.params.id, function(err, issue) {
    if (err) {
      return next(err);
    } else if (!issue) {
      return issueNotFound(res, issueId);
    }

    req.issue = issue;
    next();
  });
}


/**
 * Renvoi l'erreur 404 Not Found et un message indicant que le problème avec l'ID spécifié n'a pas été trouvé
 */

function issueNotFound(res, issueId) {
  return res.status(404).type('text').send(`No issue found with ID ${issueId}`);
}
function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}
module.exports = router;



/**
 * @apiDefine IssueIdInUrlPath
 * @apiParam (URL path parameters) {String} id L'identifiant unique d'un problème
 */

/**
 * @apiDefine IssueInRequestBody
 * @apiParam (Request body) {String} title Le titre du problème
 * @apiParam (Request body) {String="new","inProgress", "canceled", "completed"} status Le statut du problème (ne peut être qu'une de ces quatres valeurs)
 * @apiParam (Request body) {Number{-90..90}} latitude L'atitude de la location du problème
 * @apiParam (Request body) {Number{-180..180}} longitude La longitude de la location du problème
 */

/**
 * @apiDefine IssueInResponseBody
 * @apiSucces (Response Body) {String} title Le titre de l'issue
 * @apiSuccess (Response body) {String} id L'identifiant, qui est unique, définit un problème
 * @apiSuccess(Response body) {String} status Le statut du problème (ne peut être qu'une de ces quatres valeurs)
 * @apiSuccess (Response body) {String} [description] Une description est demandée pour décrire le problème
 * @apiSuccess(Response body) {String} [imageUrl] L'URL d'une photo du problème
 * @apiSuccess (Response body) {Number} latitude L'atitude de la location du problème
 * @apiSuccess (Response body) {Number} longitude La longitude de la location du problème
 * @apiSuccess (Response body) {String} tags Les mots clés, afin de trouver plus facilement le type de problème
 * @apiSuccess (Response body) {String} createdBy La personne qui a créé le problème
 * @apiSuccess (Response body) {Date} createdAt La date où le problème a été identifié
 * @apiSuccess (Response body) {Date} [updatedAt] La date de modification
 * @apiSuccess (Response body) {String} [updatedBy] La personne qui a modifié le statut

 */

/**
 * @apiDefine IssueNotFoundError
 *
 * @apiError {Object} 404/NotFound Aucun problème n a été trouvé avec l ID correspond à l URL
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *    Aucun problème trouvé avec l ID: 58b2926f5e1def0123e97281
 */

/**
 * @apiDefine IssueValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Certaines propriétés de problème sont invalides.
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 {
   "message": "Issue validation failed",
   "errors": {
     "createdBy": {
       "message": "Path `createdBy` is required.",
       "name": "ValidatorError",
       "properties": {
         "type": "required",
         "message": "Path `{PATH}` is required.",
         "path": "createdBy"
       },
       "kind": "required",
       "path": "createdBy"
     },
     "title": {
       "message": "Path `title` is required.",
       "name": "ValidatorError",
       "properties": {
         "type": "required",
         "message": "Path `{PATH}` is required.",
         "path": "title"
       },
       "kind": "required",
       "path": "title"
     },
     "status": {
       "message": "`test` is not a valid enum value for path `status`.",
       "name": "ValidatorError",
       "properties": {
         "enumValues": [
           "new",
           "inProgress",
           "canceled",
           "completed"
         ],
         "type": "enum",
         "message": "`{VALUE}` is not a valid enum value for path `{PATH}`.",
         "path": "status",
         "value": "test"
       },
       "kind": "enum",
       "path": "status",
       "value": "test"
     }
   }
 }
 */

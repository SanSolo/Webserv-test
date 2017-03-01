var express = require('express');
var router = express.Router();
// Load the full build.
const lodash = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Issue = require('../models/issue');
const User = require('../models/user');

/* GET issues listing. */
router.get('/', function(req, res, next) {
  Issue.find().sort('createdAt').exec(function(err, issues) { //lister par date de création de la plus vieille à la nouvelle  --> pour traiter les plus vieille au début
     if (err) {
       return next(err);
     }
     res.send(issues);
   });
});

/* GET specific Issue */
router.get('/:id', loadIssueFromParamsMiddleware, function(req, res, next){
  res.send(req.issue);
});

/* GET specific User */
router.get('/user/:id', loadIssuesFromUser, function(req, res, next){
  res.send(req.issues);
});

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

router.delete('/:id', loadIssueFromParamsMiddleware, function(req, res, next) {
  req.issue.remove(function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  });
});

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

function issueNotFound(res, issueId) {
  return res.status(404).type('text').send(`No issue found with ID ${issueId}`);
}
function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}
module.exports = router;

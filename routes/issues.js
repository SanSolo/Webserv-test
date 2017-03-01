var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Issue = require('../models/issue');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Issue.find().sort('createdAt').exec(function(err, issues) { //lister par date de création de la plus vieille à la nouvelle  --> pour traiter les plus vieille au début
     if (err) {
       return next(err);
     }
     res.send(issues);
   });
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


/*router.patch('/:id', utils.requireJson, loadUserFromParamsMiddleware, function(req, res, next) {

  // Update properties present in the request body
  if (req.body.firstName !== undefined) {
    req.user.firstName = req.body.firstName;
  }
  if (req.body.lastName !== undefined) {
    req.user.lastName = req.body.lastName;
  }
  if (req.body.role !== undefined) {
    req.user.role = req.body.role;
  }

  req.person.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }

    debug(`Updated user "${savedUser.firstName}"`);
    res.send(savedUser);
  });
});

router.delete('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        return next(err);
      }
      debug(`Deleted user "${req.user.firstName}"`);
      res.sendStatus(204);
    });
  });

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
}*/

module.exports = router;

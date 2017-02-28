var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find().sort('name').exec(function(err, users) {
     if (err) {
       return next(err);
     }
     res.send(users);
   });
});

/* GET specific User */
router.get('/:id', loadUserFromParamsMiddleware, function(req, res, next){
  res.send(req.user);
});

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
router.patch('/:id', loadUserFromParamsMiddleware, function(req, res, next) {

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

  req.user.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    res.send(savedUser);
  });
});
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

/*router.delete('/:id', loadUserFromParamsMiddleware, function(req, res, next) {
    req.user.remove(function(err) {
      if (err) {
        return next(err);
      }

      res.sendStatus(204);
    });
  });*/

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

function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}



module.exports = router;

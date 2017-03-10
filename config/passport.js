/*Load tools we need*/

var LocalStrategy = require('passport-local').Strategy;

/*User model*/
var User = require('../app/models/user');

/*Export function*/
module.exports = function(passport){

  /*Session setup, to keep persistent logins*/

  /*Serialize user*/
  passport.serializeUser(function(user,done){
    done(null,user.id);
  });

  /*Deserialize user*/
  passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user){
      done(err, user);
    });
  });

  /*Local signup*/
  passport.use('local-signup', new LocalStrategy({
    /*Use username only for login*/
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, username, password, done) {
    process.nextTick(function(){


    /*Find user whose username is same as the forms username*/
    User.findOne({ 'local.username' : username}, function(err,user) {


      /*If there are errors, return errors*/
      if (err){
        return done(err);
      }

      /*Check if passwords in the two fields are the same*/
      if ( req.body.password_reenter != password){
        return done(null, false, req.flash('signupMessage', "Passwords don't match."));
      }

      /*Check if there is already a user with that username*/
      if (user){
        return done(null, false, req.flash('signupMessage', "That username is already taken."));
      }
      else{

        /*Check if user with same email exists*/
        User.findOne({ 'local.email' : req.body.email}, function(err,user){

          /*If there are errors, return errors*/
          if (err){
            return done(err);
          }

          if (user){
            return done(null, false, req.flash('signupMessage', "That email is already taken."));
          }

          /*if there is no user with same credentials , create the user*/
          var newUser = new User();

          /*Get user login credentials*/
          newUser.local.username = username;
          newUser.local.email = req.body.email;
          newUser.local.password = newUser.generateHash(password);

          /*Save the user*/
          newUser.save(function(err){
            if (err){
              throw err;
            }
            return done(null, newUser);
          });

        });

      }

    });

    });

  }));


  /*LOCAL-LOGIN*/
  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback : true            //Like before pass the request to the callback too
  },
  function(req, username, password, done) {

    /*Find a user with the same username as the one in the input field*/
    User.findOne({ 'local.username' : username }, function(err,user) {

      /*If there are any errros , return the error*/
      if (err){
        return done(err);
      }

      /*If no such user was found , return a flash login message*/
      if (!user){
        console.log('DIDNT FIND USER');
        /*Check if user entered email*/
        User.findOne({ 'local.email' : username }, function(err,user) {

          /*If there are any errros , return the error*/
          if (err){
            return done(err);
          }

          if (!user){
            return done(null,false, req.flash('loginMessage', 'No such user!'));
          }

          /*If the user was found but the password is wrong*/
          if (!user.validPassword(password)){
            return done(null,false, req.flash('loginMessage', 'Wrong password!'));
          }

          /*All went well*/
          return done(null,user);

        });
      }
      else{
        /*If the user was found but the password is wrong*/
        if (!user.validPassword(password)){
          return done(null,false, req.flash('loginMessage', 'Wrong password!'));
        }

        /*All went well*/
        return done(null,user);
      }

    });
  }));

};

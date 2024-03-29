/*In this file the user is authenticated using the passport framework*/

/*Load tools we need*/
/*Strategies for authentication*/
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;

/*User model*/
var Model = require('../app/models/user');

/*Load authentication variables*/
var configAuth = require('./auth');

/*Sanitize user input*/
var sanitize = require('mongo-sanitize');

/*Export function*/
module.exports = function(passport){

  /*Session setup, to keep persistent logins*/

  /*Serialize user*/
  passport.serializeUser(function(user,done){
    done(null,user.id);
  });

  /*Deserialize user*/
  passport.deserializeUser(function(id,done){
    Model.User.findById(id, function(err,user){
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
    Model.User.findOne({ 'local.username' : sanitize(username)}, function(err,user) {


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
        Model.User.findOne({ 'local.email' : sanitize(req.body.email)}, function(err,user){

          /*If there are errors, return errors*/
          if (err){
            return done(err);
          }

          if (user){
            return done(null, false, req.flash('signupMessage', "That email is already taken."));
          }

          /*if there is no user with same credentials , create the user*/
          var newUser = new Model.User();

          /*Get user login credentials*/
          newUser.local.username = sanitize(username);
          newUser.local.email = sanitize(req.body.email);
          newUser.local.password = newUser.generateHash(password);
          newUser.local.online = "Y";
          newUser.local.socketID = "";
          newUser.local.friends = [];
          newUser.local.img = "img/user.jpg"
          newUser.type = "local";

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
    Model.User.findOne({ 'local.username' : sanitize(username) }, function(err,user) {

      /*If there are any errros , return the error*/
      if (err){
        return done(err);
      }

      /*If no such user was found , return a flash login message*/
      if (!user){
        console.log('DIDNT FIND USER');
        /*Check if user entered email*/
        Model.User.findOne({ 'local.email' : sanitize(username) }, function(err,user) {

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
          user.local.online = "Y";
          user.save(function(err){
            if (err){
              throw err;
            }
            return done(null, user);
          });

        });
      }
      else{
        /*If the user was found but the password is wrong*/
        if (!user.validPassword(password)){
          return done(null,false, req.flash('loginMessage', 'Wrong password!'));
        }

        /*All went well*/
        /*Save the user*/
        user.local.online = "Y";
        user.save(function(err){
          if (err){
            throw err;
          }
          return done(null, user);
        });
      }

    });
  }));

  /*FACEBOOK LOGIN*/
  passport.use(new FacebookStrategy({

    /*Get app id,secret and callbackurl*/
    clientID  : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL : configAuth.facebookAuth.callbackURL,
    profileFields: ['name', 'emails' , 'photos']
  },
  /*Facebook sends back token and profile of user*/
  function(token, refreshToken, profile, done) {

    /*asynchronous*/
    process.nextTick(function() {

      /*Find user in database using facebook id*/
      Model.User.findOne( { 'facebook.id' : profile.id}, function(err,user) {

        /*If there is an error*/
        if (err){
          return done(err);
        }

        /*If user is found then log in*/
        if (user){
          user.facebook.online = "Y";
          /*Save the user*/
          user.save(function(err){
            if (err){
              throw err;
            }
            return done(null, user);
          });
        }
        else{
          /*User with that id not found, so create him*/
          var newUser = new Model.User();

          /*Store all the information of the facebook user*/
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;
          newUser.facebook.online = "Y";
          newUser.facebook.socketID = "";
          newUser.facebook.friends = [];
          newUser.facebook.img = "http://graph.facebook.com/" + profile.id + "/picture?type=large";
          newUser.type = "facebook";

          /*Save user to database*/
          newUser.save(function(err) {
            if (err){
              throw err;
            }
            /*if successfull return user*/
            return done(null, newUser);
          });
        }

      });

    });

  }));

  /*GOOGLE+ LOGIN*/
  passport.use(new GoogleStrategy({

    clientID : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL : configAuth.googleAuth.callbackURL,
    passReqToCallback : true
  },
  function(request, accessToken, refreshToken, profile, done) {

    process.nextTick(function() {

      /*Check if user is already in database*/
      Model.User.findOne( {'google.id' : profile.id}, function(err,user) {

        /*If there is an error return it*/
        if(err){
          return done(err);
        }

        if(user){
          /*User found, return him*/
          /*Save the user status*/
          user.google.online = "Y";
          user.save(function(err){
            if (err){
              throw err;
            }
            return done(null, user);
          });
        }
        else{
          /*If user not in database create him*/
          var newUser = new Model.User();

          /*Store relevant information*/
          newUser.google.id = profile.id;
          newUser.google.token = accessToken;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value;
          newUser.google.online = "Y";
          newUser.google.socketID = "";
          newUser.google.friends = [];
          newUser.google.img = profile._json.image.url;
          newUser.type = "google";

          /*Store user in database*/
          newUser.save(function(err) {
            if(err){
              throw err;
            }

            return done(null,newUser);
          });
        }
      });

    });

  }));

};

/*Load tools we need*/

var LocalStrategy = require('passport-local').Strategy;

/*User model*/
var User = require('../app/models/user');

/*Export function*/
module.exports = function(passport){

  /*Session setup, to keep persistent logins*/

  /*Serialize user*/
  passport.serializeUser(function(user,done){
    console.log("I am at serialize");
    done(null,user.id);
  });

  /*Deserialize user*/
  passport.deserializeUser(function(user,done){
    User.findById(id, function(err,user){
      console.log("I am at deserialize");
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
        console.log("There was an error");
        return done(err);
      }

      /*Check if there is already a user with that username*/
      if (user){
        console.log("Error check if user already exist");
        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
      }
      else{

        console.log("Error create user");
        /*if there is no user with that username , create the user*/
        var newUser = new User();

        /*Get user login credentials*/
        newUser.local.username = username;
        newUser.local.email = req.email;
        newUser.local.password = newUser.generateHash(password);

        /*Save the user*/
        newUser.save(function(err,done){
          console.log("ERROR in saving user");
          if (err){
            throw err;
          }
          return done(null, newUser);
        });

      }

    });

    });

  }));

};

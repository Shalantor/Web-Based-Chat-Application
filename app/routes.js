var helper = require('./helper');

/*Route configuration*/

module.exports = function(app,passport) {

  /*HOME PAGE*/
  app.get('/', function(req,res){
    res.render('index.ejs');
  });

  /*LOGIN FORM*/
  app.get('/login', function(req,res){
    res.render('login.ejs', {message : req.flash('loginMessage') }); //render flash data if there is any
  });

  app.post('/login', passport.authenticate('local-login',{
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
  }));

  /*SIGNUP FORM*/
  app.get('/signup', function(req,res){
    res.render('signup.ejs', {message : req.flash('signupMessage')}); //render flash message data if there is any
  });

  app.post('/signup', passport.authenticate('local-signup',{
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  /*PROFILE PAGE*/
  app.get('/profile', isLoggedIn, function(req,res){
    res.render('profile.ejs',{
      user : req.user     //Get user , with his login data
    });
  });

  /*Route for facebook authentication and login*/
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  /*handle callback after facebook hast authenticated user*/
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook',{
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  /*LOG OUT PAGE*/
  app.get('/logout', function(req,res){
    //helper.getMessages(req.user,req.user);
    helper.setUserStatusOffline(req.user.local,req.user.facebook,req.user.google,function(){
      req.logout();
      res.redirect('/');
    });
  });

  /*Route for google+ authentication*/
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile','email'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google',{
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  /*ROUTES FOR AUTHORIZATION, WHEN USER IS ALREADY LOGGED IN , USED FOR LINKING ACCOUNTS*/

  /*LOCAL*/

  app.get('/connect/local', function(req,res) {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });
  });

  app.post('connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : 'connect/local',
    failureFlash : true
  }));

  /*FACEBOOK*/
  app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

  app.get('/connect/facebook/callback',
    passport.authorize('facebook',{
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

    /*GOOGLE */

    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

};

//Check if user is logged in
function isLoggedIn(req,res,next){

  //If user is logged in continue
  if (req.isAuthenticated()){
    return next();
  }

  //Else redirect to HOME
  res.redirect('/');
}

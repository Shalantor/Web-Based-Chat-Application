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
    req.logout();
    res.redirect('/');
  });

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

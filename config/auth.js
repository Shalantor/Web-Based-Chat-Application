/* expose module to our app for facebook login */
module.exports = {

  'facebookAuth' : {
    'clientID'    : '1663665040605998',
    'clientsecret': '07e28ada7e851dc0305b82faa6021e15',
    'callbackURL' : 'http://localhost:7331/auth/facebook/callback'
  },

  //TODO: Use actual data from twitter , temporary place holders for now
  'twitterAuth' : {
    'consumerKey' : 'consumerkey',
    'consumerSecret' :  'clientSecret',
    'callbackURL'       : 'http://localhost:7331/auth/twitter/callback'
  },

  //TODO:Use actual data from google+ , temporary place holders for now
  'googleAuth' : {
    'clientID'      : 'your-secret-clientID-here',
    'clientSecret'  : 'your-client-secret-here',
    'callbackURL'   : 'http://localhost:8080/auth/google/callback'
  }
  
};

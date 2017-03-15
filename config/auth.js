/* expose module to our app for facebook login */
module.exports = {

  'facebookAuth' : {
    'clientID'    : '1663665040605998',
    'clientSecret': '07e28ada7e851dc0305b82faa6021e15',
    'callbackURL' : 'http://localhost:7331/auth/facebook/callback'
  },

  'twitterAuth' : {
    'consumerKey' : 'zQp2FROkEdNCLm8DKDiPhh6aR',
    'consumerSecret' :  '8n8FaYvmYgXd2mO2NIRR1N1O2KFunkK07pbVyKUzop4gKbI5GA',
    'callbackURL'       : 'http://localhost:7331/auth/twitter/callback'
  },

  'googleAuth' : {
    'clientID'      : '280841855576-as2jgn5l2diq1m7hc97sqb1tcm2b1135.apps.googleusercontent.com',
    'clientSecret'  : 'AVDWnNdZ7CXkfrPIPWnyF768',
    'callbackURL'   : 'http://localhost:7331/auth/google/callback'
  }

};

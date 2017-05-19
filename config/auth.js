/* expose module to our app for facebook and google+ login */
module.exports = {

  'facebookAuth' : {
    'clientID'    : '1663665040605998',
    'clientSecret': '07e28ada7e851dc0305b82faa6021e15',
    'callbackURL' : 'http://localhost:7331/auth/facebook/callback'
  },

  'googleAuth' : {
    'clientID'      : '280841855576-as2jgn5l2diq1m7hc97sqb1tcm2b1135.apps.googleusercontent.com',
    'clientSecret'  : 'AVDWnNdZ7CXkfrPIPWnyF768',
    'callbackURL'   : 'http://localhost:7331/auth/google/callback'
  }

};

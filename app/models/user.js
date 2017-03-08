/*Load encryption module and database */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

/*define schema for our model to use in database*/
var schema = mongoose.Schema({
  local         : {
    email       : String,
    username    : String,
    password    : String
  },
  facebook      : {
    id          : String,
    token       : String,
    email       : String,
    name        : String
  },
  twitter       : {
    id          : String,
    token       : String,
    displayName : String,
    username    : String
  },
  google        : {
    id          : String,
    token       : String,
    email       : String,
    name        : String
  }
});

/*Methods to use*/

/*Generate hashs*/
schema.methods.generateHash = function(password){
  return bcrypt.hasSync(password, bcrypt.genSaltSync(8),null);
}

/* checking if password is valid*/
schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

/* export */
module.exports = mongoose.model('User', schema);

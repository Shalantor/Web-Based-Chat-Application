/*TODO: IMPORTANT: Consider changing user schema , too much time gets lost on searching user type*/

/*Load encryption module and database */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

/*define schema for our model to use in database*/
var userSchema = mongoose.Schema({
  local         : {
    email       : String,
    username    : String,
    password    : String,
    online      : String,
    socketID    : String,
  },
  facebook      : {
    id          : String,
    token       : String,
    email       : String,
    name        : String,
    online      : String,
    socketID    : String,
  },
  google        : {
    id          : String,
    token       : String,
    email       : String,
    name        : String,
    online      : String,
    socketID    : String,
  },
  friends     : [{
    id        : String,
    username  : String,
    messages  : [{
      from    : String,
      message : String
    }]
  }]
});

var groupSchema = mongoose.Schema({
  name      : String,
  users     : [String],
  messages  : [{
    from    : String,
    message : String
  }]
});

/*Methods to use*/

/*Generate hashs*/
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
}

/* checking if password is valid*/
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

/* export */
var User = mongoose.model('User', userSchema);
var Groups = mongoose.model('Groups', groupSchema);
module.exports = {
  User : User,
  Groups : Groups
};

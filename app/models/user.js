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
    friends     : [{
      id        : String,
      username  : String
    }]
  },
  facebook      : {
    id          : String,
    token       : String,
    email       : String,
    name        : String,
    online      : String,
    socketID    : String,
    friends     : [{
      id        : String,
      username  : String
    }]
  },
  google        : {
    id          : String,
    token       : String,
    email       : String,
    name        : String,
    online      : String,
    socketID    : String,
    friends     : [{
      id        : String,
      username  : String
    }]
  }
});

var messageSchema = mongoose.Schema({
  messages      : {
    fromUserType: String,
    fromUserID  : String,
    fromUsername: String,
    toUserType  : String,
    toUserID    : String,
    toUsername  : String,
    data        : String,
    timeStamp   : String
  }
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
var Message = mongoose.model('Messages', messageSchema);
module.exports = {
  User : User,
  Message : Message
};

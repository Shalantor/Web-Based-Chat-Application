/*For database operations needed for socket io*/

class Helper{

  constructor(){
    var Model = require('./models/user');
  }

  /*Add a socket id to specific user*/
  addSocketId(user,socket,callback){
    /*Check type of user*/
    if (user.local.username){
      Model.User.findOneAndUpdate({ 'local.username' : user.local.username},{'local.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
    else if (user.facebook.id){
      Model.User.findOneAndUpdate({ 'facebook.id' : user.facebook.id},{'facebook.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
    else if (user.google.id){
      Model.User.findOneAndUpdate({ 'google.id' : user.google.id},{'google.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
  }


}

module.exports = new Helper();

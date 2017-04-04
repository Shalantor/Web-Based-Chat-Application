/*For database operations needed for socket io*/

class Helper{

  constructor(){
    this.Model = require('./models/user');
  }

  /*Add a socket id to specific user*/
  addSocketId(user,socket,callback){
    /*Check type of user*/
    if (user.local){
      this.Model.User.findOneAndUpdate({ 'local.username' : user.local.username},{'local.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
    else if (user.facebook){
      this.Model.User.findOneAndUpdate({ 'facebook.id' : user.facebook.id},{'facebook.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
    else if (user.google){
      this.Model.User.findOneAndUpdate({ 'google.id' : user.google.id},{'google.socketID' : socket.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        callback(user,err);
      });
    }
  }

  /*Log out user from database*/
  logoutUser(userReq,callback){
    /*Check type of user*/
    if (userReq.local.username){
      this.Model.User.findOne({ 'local.username' : userReq.local.username}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        user.local.socketID = '';
        user.local.online = 'N';

        user.save(function(err){
          if (err){
            throw err;
          }
        });

        callback(user,err);
      });
    }
    else if (userReq.facebook.id){
      this.Model.User.findOne({ 'facebook.id' : userReq.facebook.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        user.facebook.socketID = '';
        user.facebook.online = 'N';

        user.save(function(err){
          if (err){
            throw err;
          }
        });

        callback(user,err);
      });
    }
    else if (userReq.google.id){
      this.Model.User.findOne({ 'google.id' : userReq.google.id}, function(err,user) {
        /*Throw any error that happened*/
        if (err){
          throw err;
        }
        user.google.socketID = '';
        user.google.online = 'N';

        user.save(function(err){
          if (err){
            throw err;
          }
        });

        callback(user,err);
      });
    }
  }

  /*Find user by name, return all users with that name*/
  findUsers(name){
    /*Search all 3 user types*/
    this.Model.User.find({ $or:[{ 'local.username': name},
                                   { 'facebook.name': name },
                                   { 'google.name': name}] }, function(err,users) {

      /*If there is any error, throw it */
      if (err){
        throw err;
      }
      console.log(users);
    });
  }

}

module.exports = new Helper();

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
  findUsers(name,callback){
    /*Search all 3 user types*/
    this.Model.User.find({ $or:[{ 'local.username': name},
                                   { 'facebook.name': name },
                                   { 'google.name': name}] }, function(err,users) {

      /*If there is any error, throw it */
      if (err){
        throw err;
      }

      /*Info to send back to client*/
      var foundUsers = [];

      /*Fill above array with each users info*/
      users.forEach(function(element){
        if (element.local.username){
          foundUsers.push({'id':element._id,'name':element.local.username});
        }
        else if(element.facebook.id){
          foundUsers.push({'id':element._id,'name':element.facebook.name});
        }
        else if(element.google.id){
          foundUsers.push({'id':element._id,'name':element.google.name});
        }
      });

      callback(foundUsers);

    });
  }

  /*Add two users to each others friends list*/
  addFriends(requestUser,otherUserId,otherUserName,callback){

    /*First find this user and update his friends list*/
    this.Model.User.findOne({'_id' : requestUser._id} , function(err,user){

      /*If there was any error throw it*/
      if (err){
        throw err;
      }

      /*Add to array of friends*/
      user.friends.push({'id' : otherUserId,'username' : otherUserName});

      /*Store back into database*/
      user.save(function(err){
        if (err){
          throw err;
        }

      });
    });

    /*Update the other users friends list*/
    /*Get his name*/
    var thisUserName ;
    if (requestUser.local){
      thisUserName = requestUser.local.username;
    }
    else if(requestUser.facebook){
      thisUserName = requestUser.facebook.name;
    }
    else if(requestUser.google){
      thisUserName = requestUser.google.name;
    }

    /*Find other user in database*/
    this.Model.User.findOne({'_id' : otherUserId} , function(err,otherUser){

      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      otherUser.friends.push({'id' : requestUser._id,'username' : thisUserName});

      /*Store into database*/
      otherUser.save(function(err){
        if (err){
          throw err;
        }
      });

    });

    callback();

  }

  /*Function to sort out users that the user sending the request has already in his friends list*/
  sortOutExistingFriends(friendList,userId,callback){
    this.Model.User.findOne({'_id' : userId} , function(err,user){

      /*if there is any error throw it*/
      if (err){
        throw err;
      }

      /*Get friends user already has*/
      var userFriendList = user.friends;

      userFriendList.forEach(function(element){
        for(var i=0; i< friendList.length; i++){
          if(element.id == friendList[i].id){
            friendList.splice(i,1);
            break;
          }
        }
      });

      callback(friendList);

    });
  }

  /*TODO: Doesnt work when friend was just added , check what is error,
  seems that '' userId gets sent */
  /*Store message , to keep chat history between two users*/
  storeAndSendMessage(userId,friendId,isSendingUser,message,callback){
    this.Model.User.findOne({'_id' : userId} , function(err,user){

      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      /*Check if it is this user who sent message, used to differentiate in client*/
      var from;
      var socketID;
      if (isSendingUser){
        from = 'me';
        socketID = null;
      }
      else{
        from = 'not_me';
        if (user.local.username){
          socketID = user.local.socketID;
        }
        else if (user.facebook.id){
          socketID = user.facebook.socketID;
        }
        else if (user.google.id){
          socketID = user.google.socketID;
        }
      }

      /*Add to list of messages*/
      user.friends.forEach(function(element){
        if (element.id == friendId){
          element.messages.push({ 'from' : from, 'message' : message });
        }
      });

      /*Store into database*/
      user.save(function(err){
        if (err){
          throw err;
        }
        callback(socketID);
      });

    });
  }

}

module.exports = new Helper();

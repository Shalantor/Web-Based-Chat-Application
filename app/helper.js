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
  findUsers(userId,name,callback){
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
        if(element.id == userId){
        }
        else if (element.local.username){
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

      /*Get user socketID*/
      var socketID;
      if (otherUser.local.username){
        socketID = otherUser.local.socketID;
      }
      else if (otherUser.facebook.id){
        socketID = otherUser.facebook.socketID;
      }
      else if(otherUser.google.id){
        socketID = otherUser.google.socketID;
      }

      /*Store into database*/
      otherUser.save(function(err){
        if (err){
          throw err;
        }
      });

      callback(thisUserName,requestUser._id,socketID);

    });

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

      /*Remove duplicates*/
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

  /*Return chat messages between two users*/
  getChatHistory(userId,friendId,callback){

    /*find user*/
    this.Model.User.findOne({'_id' : userId} , function(err,user){

      /*If there is any error throw it*/
      if(err){
        throw err;
      }

      var messages = [];
      /*Find friend*/
      user.friends.forEach(function(element){
        if (element.id == friendId){
          messages = element.messages;
        }
      });

      callback(messages);

    });
  }

  /*Add group to database*/
  createGroup(groupName,groupMembers,callback){

    /*Create new group*/
    var group = new this.Model.Groups({
      name : groupName,
      users : groupMembers,
      messages : []
    });

    group.save(function(err,newGroup){
      if(err){
        throw err;
      }
      callback(newGroup._id);
    });
  }

  /*Add group id to user that is part of it*/
  addGroupToUser(userId,groupName,groupId,callback){
    this.Model.User.findOne({'_id' : userId} , function(err,user){

      /*If there was an error throw it*/
      if(err){
        throw err;
      }

      /*Update array of groups that user is a member of*/
      user.groups.push({'id' : groupId, 'name' : groupName});

      user.save(function(err){
        if(err){
          throw err;
        }
        callback();
      });

    });
  }

  /*Get socketIDs of array of users*/
  getSocketIds(userIds,callback){

    var socketIDs = [];
    var model = this.Model.User;

    userIds.forEach(function(element,index){
      model.findOne({'_id' : element} , function(err,user){
          if(err){
            throw err;
          }

          if(user.local.username){
            socketIDs.push(user.local.socketID);
          }
          else if(user.facebook.id){
            socketIDs.push(user.facebook.socketID);
          }
          else if(user.google.id){
            socketIDs.push(user.google.socketID);
          }

          if(index === (userIds.length - 1)){
            callback(socketIDs);
          }

      });
    });
  }

  /*Get chat history for a group chat*/
  getChatHistoryForGroup(groupId,callback){
    this.Model.Groups.findOne({'_id' : groupId} , function(err,group){
      if(err){
        throw err;
      }
      callback(group.messages);
    });
  }

  /*Store group message*/
  storeAndSendGroupMessage(groupId,fromUser,message,callback){
    this.Model.Groups.findOne({'_id' : groupId} , function(err,group){
      if(err){
        throw err;
      }
      group.messages.push({'from':fromUser, 'message': message});
      group.save(function(err){
        callback();
      });
    });
  }

  /*Get users for specific group id, filter out user that sent the message*/
  getUsers(userId,groupId,callback){
    this.Model.Groups.findOne({'_id' : groupId} , function(err,group){
      if(err){
        throw err;
      }
      for(var i=0; i < group.users.length; i++){
          if(group.users[i] === userId){
            group.users.splice(i,1);
            callback(group.users);
          }
      }
    });
  }

  /*Find friends with specific name to add to group chat*/
  findFriends(userId,name,callback){
    /*Search all 3 user types*/
    this.Model.User.findOne({'_id' : userId} , function(err,user){

      /*If there is any error, throw it */
      if (err){
        throw err;
      }

      /*Info to send back to client*/
      var foundUsers = []

      /*Check if users with that name is list*/
      user.friends.forEach(function(element){
        if(element.username === name){
          foundUsers.push({'id':element.id,'name':element.username});
        }
      });

      callback(foundUsers);
    });
  }

  /*Send user a friend request from another user*/
  sendFriendRequest(fromUser,toUserId,callback){

    var fromUserName;

    if(fromUser.local){
      fromUserName = fromUser.local.username;
    }
    else if(fromUser.facebook){
      fromUserName = fromUser.facebook.name;
    }
    else if(fromUser.google){
      fromUserName = fromUser.google.name;
    }

    this.Model.User.findOne({'_id' : toUserId} , function(err,user){
      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      /*Check if user already got a friend request from that particular user*/
      var doesExist = false;
      for (var i=0; i < user.friendRequests.length; i++){
        if (user.friendRequests[i].fromId == fromUser._id){
          doesExist = true;
          break;
        }
      }

      if(doesExist){
        callback(false,null);
      }
      else{
        /*Add friend request to list*/
        user.friendRequests.push({'fromId':fromUser._id,'fromName':fromUserName});

        /*Get socket Id*/
        var socketID;
        if(user.local.username){
          socketID = user.local.socketID;
        }
        else if(user.facebook.id){
          socketID = user.facebook.socketID;
        }
        else if(user.google.id){
          socketID = user.google.socketID;
        }

        /*Store user back to database*/
        user.save(function(err){
          /*If there is any error throw it*/
          if (err){
            throw err;
          }
          callback(true,socketID);
        });
      }

    });
  }

  /*Function to delete a friend request, either because user accepted it or ignored it*/
  deleteFriendRequest(thisUserId,fromUserId,callback){

    this.Model.User.findOne({'_id' : thisUserId} , function(err,user){
      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      /*Remove that particular friend request*/
      for (var i=0; i < user.friendRequests.length; i++){
        if (user.friendRequests[i].fromId == fromUserId){
          user.friendRequests.splice(i,1);
          break;
        }
      }

      /*Store user back to database*/
      user.save(function(err){
        /*If there is any error throw it*/
        if (err){
          throw err;
        }
        callback();
      });

    });

  }

  /*Delete user from friend list*/
  deleteFriend(userId,friendId,callback){

    this.Model.User.findOne({'_id' : thisUserId} , function(err,user){
      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      /*Remove that particular friend*/
      for (var i=0; i < user.friends.length; i++){
        if (user.friends[i].id == friendId){
          user.friends.splice(i,1);
          break;
        }
      }

      /*Get socket Id*/
      var socketID;
      if(user.local.username){
        socketID = user.local.socketID;
      }
      else if(user.facebook.id){
        socketID = user.facebook.socketID;
      }
      else if(user.google.id){
        socketID = user.google.socketID;
      }

      /*Store user back to database*/
      user.save(function(err){
        /*If there is any error throw it*/
        if (err){
          throw err;
        }
        callback(socketID);
      });

    });
  }

  /*User wants to leave a group conversation*/
  leaveGroup(userId,groupId,callback){

    var groupModel = this.Model.Groups;

    this.Model.User.findOne({'_id' : thisUserId} , function(err,user){
      /*If there is any error throw it*/
      if (err){
        throw err;
      }

      /*Remove that particular group from list of groups*/
      for (var i=0; i < user.groups.length; i++){
        if (user.groups[i].id == groupId){
          user.groups.splice(i,1);
          break;
        }
      }

      /*Store user back to database*/
      user.save(function(err){
        /*If there is any error throw it*/
        if (err){
          throw err;
        }

        /*Delete user from groups*/
        groupModel.findOne({'_id' : groupId},function(err,group){
          /*If there is any error throw it*/
          if (err){
            throw err;
          }

          /*Remove that particular user from list of groups*/
          for (var i=0; i < group.users.length; i++){
            if (group.users[i] == userId){
              group.users.splice(i,1);
              break;
            }
          }

          /*Store group back to database*/
          group.save(function(err){
            /*If there is any error throw it*/
            if (err){
              throw err;
            }
            callback(group.users);
          });

        });
      });

    });

  }

}

module.exports = new Helper();

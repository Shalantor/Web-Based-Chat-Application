/*Listen for requests from clients and act accordingly*/

var helper = require('./helper');

/*Initialize socket io server*/
var init = function(app){

  /*Server and socket io*/
  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  /*User connects for first time*/
  io.on('connection', function(socket){

    var data = {};
    socket.emit('ehlo',data);

    socket.on('ehlo-response',function(data){
      /*When user connects store his socket.id in database, for future socket operations*/
      helper.addSocketId(data,socket,function(user,socket,err){
        if (err){
          console.log('An error occurred');
        }
        else{
          console.log('Everything is ok!');
        }
      });
    });

    /*Delete a friend request*/
    socket.on('delete-request',function(data){
      helper.deleteFriendRequest(data.user._id,data.otherUser,function(){
        socket.emit('delete-request-response',null);
      });
    });

    /*User wants to send a friend request to another user*/
    socket.on('send-request',function(info){
      console.log('GOT REQUEST');
      helper.sendFriendRequest(info.thisUser,info.otherUser,function(success,socketID){
        var data = {'success' : success, 'isMine': true};
        socket.emit('send-request-response',data);

        /*Must create array because of how function works*/
        if (success === true){
          var name;
          var picture;
          if (info.thisUser.local){
            name = info.thisUser.local.username;
            picture = 'img/user.jpg';
          }
          else if(info.thisUser.facebook){
            name = info.thisUser.facebook.name;
            picture = info.thisUser.facebook.img;
          }
          else if(info.thisUser.google){
            name = info.thisUser.google.name;
            picture = info.thisUser.google.img;
          }
          console.log('Sending to socketId lol ' + socketID);
          console.log('Picture is ' + picture);
          var otherData = {'isMine' : false, 'fromId': info.thisUser._id, 'fromName': name, 'picture':picture};
          io.to(socketID).emit('send-request-response', otherData);
        }
      });
    });

    /*User wants to add a friend*/
    socket.on('find-user',function(info){
      helper.findUsers(info.id,info.name,function(foundNames){
        helper.sortOutExistingFriends(foundNames,info.id,function(finalList){
          socket.emit('find-user-response',finalList);
        });
      });
    });

    socket.on('add-user-group',function(info){
      helper.findFriends(info.id,info.name,function(foundNames){
        socket.emit('add-user-group-response',foundNames);
      });
    });

    socket.on('disconnect',function(){
      console.log('user disconnected');
    });

    /*The user wants to search for another user based on the name he typed
    So search the database for the name and return the users that were found*/
    socket.on('add-user', function(info){
      helper.addFriends(info.thisUser,info.otherUser,info.otherUserName,info.pic,function(thisUserName,thisUserID,socketID,thisUserPic){
        /*Inform client that everything went alright*/
        var data = {'id':info.otherUser, 'name' : info.otherUserName, 'pic': info.pic};
        socket.emit('add-user-response',data);
        /*Update other user if online*/
        if (socketID !== ''){
          var otherData = {'id':thisUserID, 'name' : thisUserName, 'pic':thisUserPic};
          io.to(socketID).emit('add-user-response', otherData);
        }
      });
    });

    /*The user wants to send a message to another user*/
    socket.on('send-message',function(data){
      if (data.isGroup === false){
        helper.storeAndSendMessage(data.thisUser._id,data.otherUser,true,data.message,function(socketID){
          helper.storeAndSendMessage(data.otherUser,data.thisUser._id,false,data.message,function(socketID){
            /*Send back to verify that message was sent*/
            socket.emit('send-message-response',null);
            var img;
            var name;
            if(data.thisUser.type === 'local'){
              img = 'img/user.jpg';
              name = data.thisUser.local.username;
            }
            else if(data.thisUser.type ==='facebook'){
              img = data.thisUser.facebook.img;
              name = data.thisUser.facebook.name;
            }
            else if(data.thisUser.type === 'google'){
              img = data.thisUser.google.img;
              name = data.thisUser.google.name;
            }
            var sendData = {'fromId': data.thisUser._id, 'message': data.message, 'isGroup': false,'img':img,'name':name};
            io.to(socketID).emit('send-message-response', sendData);
          });
        });
      }
      else{
        helper.storeAndSendGroupMessage(data.group,data.thisUser,data.message,function(){
          helper.getUsers(data.thisUser._id,data.group,function(users){
            helper.getSocketIds(users,function(socketIDs){
              socketIDs.forEach(function(element){
                if(element !== ''){
                  var dataToSend = {};
                  dataToSend.fromId = data.group;
                  dataToSend.message = data.message;
                  dataToSend.isGroup = true;
                  data.userThatSent = data.thisUser._id;
                  var img;
                  var name;
                  if(data.thisUser.type === 'local'){
                    img = 'img/user.jpg';
                    name = data.thisUser.local.username;
                  }
                  else if(data.thisUser.type ==='facebook'){
                    img = data.thisUser.facebook.img;
                    name = data.thisUser.facebook.name;
                  }
                  else if(data.thisUser.type === 'google'){
                    img = data.thisUser.google.img;
                    name = data.thisUser.google.name;
                  }
                  dataToSend.name = name;
                  dataToSend.img = img;
                  io.to(element).emit('send-message-response', dataToSend);
                }
              });
            });
          });
        });
      }
    });

    /*Get user chat history*/
    socket.on('get-chat-history',function(data){
      if(data.isGroup === false){
        helper.getChatHistory(data.userId,data.friendId,function(data){
          socket.emit('get-chat-history-response',data);
        });
      }
      else{
        console.log('GOT REQUEST FOR CHAT HISTORY IN GROUP');
        helper.getChatHistoryForGroup(data.groupId,function(messages){
          socket.emit('get-chat-history-response',{'messages':messages});
        });
      }
    });

    /*User wants to create group chat*/
    socket.on('create-group',function(data){
      helper.createGroup(data.groupName,data.users,function(groupId){
        var usersProcessed = 0;
        data.users.forEach(function(element){
          helper.addGroupToUser(element,data.groupName,groupId,function(){
            usersProcessed ++;
            if (usersProcessed == data.users.length){
              /*Get Socket ids of users*/
              helper.getSocketIds(data.users,function(socketIDs){
                var dataToSend = {'id': groupId, 'name' : data.groupName};
                socketIDs.forEach(function(element){
                  if(element !== ''){
                    io.to(element).emit('create-group-response', dataToSend);
                  }
                });
              });
            }
          });
        });
      });
    });

    /*User wants to delete friend*/
    socket.on('delete-friend',function(info){
      helper.deleteFriend(info.userId,info.friendId,function(socketID){
        socket.emit('delete-friend-response',{'id':info.friendId,'isMine':true});
        helper.deleteFriend(info.friendId,info.userId,function(socketID){
          io.to(socketID).emit('delete-friend-response',{'id':info.userId,'isMine':false});
        });
      });
    });

    /*user wants to leave a group conversation*/
    socket.on('leave-group',function(data){
      helper.leaveGroup(data.userId,data.groupId,function(){
        socket.emit('leave-group-response',{'userThatLeft': data.userId});
      });
    });

    /*Request for members of a group*/
    socket.on('get-group-members',function(data){
      helper.getGroupMembers(data.groupId,function(usernames){
        socket.emit('get-group-members-response',usernames);
      });
    });

  });

  return server;

}

/*Export this file*/
module.exports = init;

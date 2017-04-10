var helper = require('./helper');

/*Initialize socket io server*/
var init = function(app){

  var server = require('http').Server(app);
  var io = require('socket.io')(server);


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

    /*User wants to add a friend*/
    socket.on('find-user',function(info){
      helper.findUsers(info.id,info.name,function(foundNames){
        helper.sortOutExistingFriends(foundNames,info.id,function(finalList){
          socket.emit('find-user-response',finalList);
        });
      });
    });

    /*TODO:As of now , user can add anyone to chat with. Change to friends only*/
    socket.on('add-user-group',function(info){
      helper.findUsers(info.id,info.name,function(foundNames){
        socket.emit('add-user-group-response',foundNames);
      });
    });

    socket.on('disconnect',function(){
      console.log('user disconnected');
    });

    /*The user wants to search for another user based on the name he typed
    So search the database for the name and return the users that were found*/
    socket.on('add-user', function(info){
      helper.addFriends(info.thisUser,info.otherUser,info.otherUserName,function(thisUserName,thisUserID,socketID){
        /*Inform client that everythingwent alright*/
        var data = {'id':info.otherUser, 'name' : info.otherUserName};
        socket.emit('add-user-response',data);
        /*Update other user if online*/
        if (socketID !== ''){
          var otherData = {'id':thisUserID, 'name' : thisUserName};
          io.to(socketID).emit('add-user-response', otherData);
        }
      });
    });

    /*The user wants to send a message to another user*/
    socket.on('send-message',function(data){
      helper.storeAndSendMessage(data.thisUser,data.otherUser,true,data.message,function(socketID){
        helper.storeAndSendMessage(data.otherUser,data.thisUser,false,data.message,function(socketID){
          /*Send back to verify that message was sent*/
          socket.emit('send-message-response',null);
          var sendData = {'fromId': data.thisUser, 'message': data.message};
          io.to(socketID).emit('send-message-response', sendData);
        });
      });
    });

    /*Get user chat history*/
    socket.on('get-chat-history',function(data){
      if(data.isGroup === false){
        helper.getChatHistory(data.userId,data.friendId,function(messages){
          socket.emit('get-chat-history-response',messages);
        });
      }
      else{
        console.log('IS GROUP');
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

  });

  return server;

}

module.exports = init;

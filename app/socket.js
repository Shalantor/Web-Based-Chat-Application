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
      helper.findUsers(info.name,function(foundNames){
        helper.sortOutExistingFriends(foundNames,info.id,function(finalList){
          socket.emit('find-user-response',finalList);
        });
      });
    });

    socket.on('disconnect',function(){
      console.log('user disconnected');
    });

    /*The user wants to search for another user based on the name he typed
    So search the database for the name and return the users that were found*/
    socket.on('add-user', function(info){
      helper.addFriends(info.thisUser,info.otherUser,info.otherUserName,function(){
        /*Inform client that everythingwent alright*/
        var data = {'id':info.otherUser, 'name' : info.otherUserName};
        socket.emit('add-user-response',data);
      });
    });

    /*The user wants to send a message to another user*/
    socket.on('send-message',function(data){
      console.log(data);
      helper.storeAndSendMessage(data.thisUser,data.otherUser,true,data.message,function(){
        helper.storeAndSendMessage(data.otherUser,data.thisUser,false,data.message,function(){
          /*Send back to verify that message was sent*/
          socket.emit('send-message-response',null);
        });
      });
    });

  });

  return server;

}

module.exports = init;

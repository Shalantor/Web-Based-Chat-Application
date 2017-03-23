/*Used for real time messaging between users*/

var path = require('path');
var helper = require('./helper');

class Socket{

  constructor(socket){
    this.io = socket;
  }

  socketEvents(){

    /*What to do on connection*/
    this.io.on('connection', function(socket){

      /*User wants to get chat-list*/
      /*Data is the data I get from client side*/
      socket.on('chat-list',function(data){

        let chatListResponse = {};

        if (!data){
          chatListResponse.error = true;
          chatListResponse.message = 'User does not exist';

          this.io.emit('chat-list-response',chatListResponse);
        }
        else{
          helper.getUserInfo(data,function(err,userInfo){

            helper.getOnlineUsers(function(err,onlineUsers){

              this.io.to(socket.id).emit('chat-list-response',{
                error : false,
                singleUser : false,
                chatList : onlineUsers
              });

              socket.broadcast.emit('chat-list-response',{
                error : false,
                singleUser : true,
                chatList : userInfo
              });

            });

          });
        }

      });


      /*User wants to send a message*/
      socket.on('add-message', function(data){

        if (data.message === ''){
          this.io.to(socket.id).emit('add-message-response','Message cant be empty' );
        }
        else if (!data.fromUser){
          this.io.to(socket.id).emit('add-message-response','Unexpected error, Login again.');
        }
        else if (!data.toUser){
          this.io.to(socket.id).emit('add-message-response','Select a user to chat.');
        }
        else{

          helper.insertMessage(data.fromUser,data.toUser,data.message,function(){
            this.io.to(data.toUser.socketID).emit('add-message-response',data);
          });

        }
      });


      /*To log out the user and make it visible to other users*/
      socket.on('logout',function(user){

        this.io.to(socket.id).emit('logout-response',{
          error : false
        });

        socket.broadcast.emit('chat-list-response',{
          error : false ,
          userDisconnected : true ,
          socketId : socket.id
        });

      })


      /*User disconnected, inform others*/
      socket.ond('disconnect',function(){
        socket.broadcast.emit('chat-list-response',{
          error : false,
          userDisconnected : true,
          socketID : socket.id
        });
      });

    }


  }

  socketConfig(){

    this.io.use(function(socket,next){
      let user = socket.request.user;
      let userSocketId = socket.id;

      helper.updateSocketID(user,userSocketId,function(error,response){
        //updated id for user socket
      });
      next();
    });

    this.socketEvents();

  }

}

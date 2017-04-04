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
    socket.on('find-user',function(name){
      helper.findUsers(name,function(foundNames){
        socket.emit('find-user-response',foundNames);
      });
    });

    socket.on('disconnect',function(){
      console.log('user disconnected');
    });

    /*The user wants to search for another user based on the name he typed
    So search the database for the name and return the users that were found*/
    socket.on('add-user', function(info){
      console.log('ADD USER MESSAGE ' + info);
    });

  });

  return server;

}

module.exports = init;

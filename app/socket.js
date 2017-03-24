var helper = require('./helper');

/*Initialize socket io server*/
var init = function(app){

  var server = require('http').Server(app);
  var io = require('socket.io')(server);


  io.on('connection', function(socket){

    /*The logs just exist for testing the application*/
    console.log(socket.client.request);

    /*When user connects store his socket.id in database, for future socket operations*/
    helper.addSocketId(socket.request.user,socket,function(user,err){
      if (err){
        console.log('An error occurred');
      }
      else{
        console.log('Everything is ok!');
      }
    });

    socket.on('disconnect',function(){
      console.log('user disconnected');
    });

    /*The user wants to search for another user based on the name he typed
    So search the database for the name and return the users that were found*/
    socket.on('find-user', function(msg){
      io.emit('chat message', msg);
    });
  });

  return server;

}

module.exports = init;

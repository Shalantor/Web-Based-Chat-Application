/*Initialize socket io server*/
var init = function(app){

  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  io.on('connection', function(socket){
    console.log('user connected');
    socket.on('disconnect',function(){
      console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
  });

  return server;

}

module.exports = init;

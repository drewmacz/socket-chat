// IMPORTS
//==============================================================================
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// REGISTER PUBLIC DIRECTORY
//==============================================================================
app.use(express.static(__dirname + '/public'));

// SEND INDEX FOR ALL ROUTES
//==============================================================================
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// HANDLE EVENTS
//==============================================================================
io.on('connection', function(socket) {
  console.log('user connected');
  socket.broadcast.emit('user connected');

  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

// START SERVER
//==============================================================================
http.listen(3000, function() {
  console.log('listening on *:3000');
});

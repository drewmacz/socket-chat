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
  var addUser = false;

  socket.on('add user', function(username) {
    if (addUser) return;

    socket.username = username;

    socket.emit('login');
    socket.broadcast.emit('user connected');
  });

  socket.on('chat message', function(message) {
    io.emit('chat message', {
      username: socket.username,
      text: message
    });
  });

  socket.on('disconnect', function() {
    socket.broadcast.emit('user disconnected', {
      username: socket.username
    });
  });
});

// START SERVER
//==============================================================================
http.listen(3000, function() {
  console.log('listening on *:3000');
});

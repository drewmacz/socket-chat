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
var connectedUsers = [];

io.on('connection', function(socket) {
  var addUser = false;

  socket.emit('connected', {
    users: connectedUsers
  });

  socket.on('add user', function(username) {
    if (addUser) return;

    for (var i = connectedUsers.length - 1; i >= 0; i--) {
      if (connectedUsers[i] === username) {
        socket.emit('username taken');
        return;
      }
    }

    addUser = true;
    socket.username = username;
    connectedUsers.push(username);

    socket.emit('login', {
      username: socket.username
    });
    io.emit('user connected', {
      username: socket.username,
      users: connectedUsers
    });
  });

  socket.on('chat message', function(message) {
    io.emit('chat message', {
      username: socket.username,
      text: message
    });
  });

  socket.on('disconnect', function() {
    if (addUser) {
      // remove the disconned user from list of
      //   all connected users
      for (var i = connectedUsers.length - 1; i >= 0; i--) {
        if (connectedUsers[i] === socket.username) {
          connectedUsers.splice(i, 1);
          break;
        }
      }

      // send an event to the clients and pass
      //   the new list of users
      io.emit('user disconnected', {
        username: socket.username,
        users: connectedUsers
      });
    }
  });
});

// START SERVER
//==============================================================================
http.listen(3000, function() {
  console.log('listening on *:3000');
});

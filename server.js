// IMPORTS
//==============================================================================
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// REGISTER PUBLIC DIRECTORY
//==============================================================================
app.use(express.static(__dirname + '/public'));

// SEND INDEX PAGE FOR ALL ROUTES
//==============================================================================
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// HANDLE EVENTS
//==============================================================================
// list of currently connected users
var connectedUsers = [];

io.on('connection', function(socket) {
  var addUser = false;

  // this user loaded the page
  socket.emit('connected', {
    users: connectedUsers
  });

  // this user is trying to log on
  socket.on('add user', function(username) {
    // check if the user has already
    //   logged in
    if (addUser) return;

    // check if the username is taken
    for (var i = connectedUsers.length - 1; i >= 0; i--) {
      if (connectedUsers[i] === username) {
        socket.emit('username taken');
        return;
      }
    }

    addUser = true;
    socket.username = username;
    connectedUsers.push(username);

    // tell this user they are logged in
    socket.emit('login', {
      username: socket.username
    });
    // tell everyone this user logged in
    io.emit('user connected', {
      username: socket.username,
      users: connectedUsers
    });
  });

  // this user sent a chat message
  socket.on('chat message', function(message) {
    // send the message to all users
    io.emit('chat message', {
      username: socket.username,
      text: message
    });
  });

  // this user disconnected
  socket.on('disconnect', function() {
    // check if the user was logged in
    //   before they left
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

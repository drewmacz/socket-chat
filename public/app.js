// declare angular app and get a reference to it
var app = angular.module('chatClient', []);

// controller for index
app.controller('chatCtrl', function($scope) {
  // use socket
  var socket = io();

  // FIELDS
  //============================================================================
  $scope.loggedIn = false;
  $scope.username = '';
  $scope.inputText = '';
  $scope.users = [];
  $scope.messages = [];

  // SOCKET EVENTS
  //============================================================================
  socket.on('connected', function(data) {
    $scope.$apply(function() {
      $scope.users = data.users;
    });
    Materialize.toast('users connected: ' + $scope.users.length, 2000);
  });

  // user logged in
  socket.on('login', function(user) {
    // set the view to submit messages
    //   instead of log in
    $scope.$apply(function() {
      $scope.loggedIn = true;
      $scope.username = user.username;
    });
  });

  // tried to log in, but someone already
  //   has the username
  socket.on('username taken', function() {
    Materialize.toast('username taken', 2000);
  });

  // someone sent a message to the server
  socket.on('chat message', function(message) {
    // add the new message with the view
    $scope.$apply(function() {
      $scope.messages.push(message);
    });
    window.scrollTo(0, document.body.scrollHeight);
  });

  // a new user connected
  socket.on('user connected', function(data) {
    $scope.$apply(function() {
      $scope.users = data.users;
      $scope.messages.push({text: data.username + ' connected'});
    });
    window.scrollTo(0,document.body.scrollHeight);
  });

  // a user disconnected
  socket.on('user disconnected', function(data) {
    $scope.$apply(function() {
      $scope.users = data.users;
      $scope.messages.push({text: data.username + ' disconnected'});
    });
    window.scrollTo(0,document.body.scrollHeight);
  });

  // PAGE FUNCTIONS
  //============================================================================
  // logs the user in with the specified username
  //   taken from inputText
  $scope.login = function() {
    // do not allow blank usernames and usernames
    //   longer than 20 characters
    if ($scope.inputText !== '' && $scope.inputText.length <= 20) {
      socket.emit('add user', $scope.inputText);
      $scope.inputText = '';
    }
    else {
      Materialize.toast('username must be 1-20 characters', 3000);
    }
  };

  // called when the send button is pressed
  // sends their message to the server
  $scope.send = function() {
    if ($scope.inputText !== '' && $scope.inputText.length <= 500) {
      socket.emit('chat message', $scope.inputText);
      $scope.inputText = '';
    }
    else {
      Materialize.toast('message must be 1-500 characters', 3000);
    }
  };

});

// declare angular app and get a reference to it
var app = angular.module('chatClient', []);

// controller for index
app.controller('chatCtrl', function($scope) {
  // use socket
  var socket = io();

  // FIELDS
  //============================================================================
  $scope.loggedIn = false;
  $scope.inputText = '';
  $scope.messages = [];

  // SOCKET EVENTS
  //============================================================================
  // user logged in
  socket.on('login', function() {
    // set the view to submit messages
    //   instead of log in
    $scope.$apply(function() {
      $scope.loggedIn = true;
    });
  });

  // someone sent a message to the server
  socket.on('chat message', function(message) {
    // add the new message with the view
    $scope.$apply(function() {
      $scope.messages.push(message);
    });
  });

  // PAGE FUNCTIONS
  //============================================================================
  // logs the user in with the specified username
  //   taken from inputText
  $scope.login = function() {
    socket.emit('add user', $scope.inputText);
    $scope.inputText = '';
  };

  // called when the send button is pressed
  // sends their message to the server
  $scope.send = function() {
    socket.emit('chat message', $scope.inputText);
    $scope.inputText = '';
  };

});

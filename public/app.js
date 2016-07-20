// declare angular app and get a reference to it
var app = angular.module('chatClient', []);

// controller for index
app.controller('chatCtrl', function($scope) {
  // use socket
  var socket = io();

  // fields
  $scope.inputText = '';
  $scope.messages = [];

  // event: someone sent a message to the server
  socket.on('chat message', function(msg) {
    // add the new message with the view
    $scope.$apply(function() {
      $scope.messages.push(msg);
    });
  });

  // called when the send button is pressed
  // sends their message to the server
  $scope.send = function() {
    socket.emit('chat message', $scope.inputText);
    $scope.inputText = '';
  };
});

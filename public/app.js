// declare angular app and get a reference to it
var app = angular.module('chatClient', []);

// controller for index
app.controller('chatCtrl', function($scope, $window, $timeout) {
  // use socket
  var socket = io();

  // FIELDS
  //============================================================================
  $scope.loggedIn = false;
  $scope.username = '';
  $scope.selectedColor = 'red';
  $scope.navColor = 'blue-grey';
  $scope.buttonColor = 'teal';
  $scope.inputText = '';
  $scope.users = [];
  $scope.messages = [];
  $scope.typingUsers = [];
  $scope.showUsers = true;
  $scope.typing = false;

  // SOCKET EVENTS
  //============================================================================
  // user established initial connection to the server
  socket.on('connected', function(data) {
    $scope.$apply(function() {
      $scope.users = data.users;
    });
    Materialize.toast('users connected: ' + $scope.users.length, 1000);

    if ($scope.loggedIn) {
      // connection to server was lost at some point
      //   while the user was logged in
      // try to log back in with same username
      $scope.$apply(function() {
        $scope.messages.push({text: $scope.username + ' disconnected'});
        $scope.inputText = $scope.username;
        $scope.login();
      });
    }
  });

  // user logged in
  socket.on('login', function(user) {
    // set the view to submit messages
    //   instead of log in
    $scope.$apply(function() {
      $scope.loggedIn = true;
      $scope.username = user.username;
      $scope.navColor = user.color;
      $scope.buttonColor = user.color;
    });
  });

  // tried to log in, but someone already
  //   has the username
  socket.on('username taken', function() {
    if ($scope.loggedIn) {
      // user lost connection to the server
      //   and then someone else took their
      //   username
      // reset the application state
      $scope.$apply(function() {
        $scope.loggedIn = false;
        $scope.username = '';
        $scope.navColor = 'blue-grey';
        $scope.buttonColor = 'teal';
        $scope.inputText = '';
      });
      Materialize.toast('logged out due to inactivity', 2000);
    }
    else {
      Materialize.toast('username taken', 2000);
    }
  });

  // someone sent a message to the server
  socket.on('chat message', function(message) {
    // add the new message with the view
    $scope.$apply(function() {
      $scope.messages.push(message);
    });
    window.scrollTo(0, document.body.scrollHeight);
  });

  // someone has started or stopped typing
  socket.on('user typing', function(data) {
    // update the list of typing users
    $scope.$apply(function() {
      $scope.typingUsers = data.typing;
    });
    window.scrollTo(0, document.body.scrollHeight);
  });

  // user tried to send a message, but
  //   was not logged in
  socket.on('logged out', function() {
    Materialize.toast('logged out due to inactivity', 2000);
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
      socket.emit('add user', {
        username: $scope.inputText,
        color: $scope.selectedColor
      });
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
      $scope.stopTyping();
    }
    else {
      Materialize.toast('message must be 1-500 characters', 3000);
    }
  };

  // called every time the message input changes
  // tells the server the user is typing and
  //   sets a timer that will tell the server
  //   they are not typing when it finishes
  var inputChangedPromise;
  $scope.inputChanged = function() {
    if (inputChangedPromise) {
      $timeout.cancel(inputChangedPromise);
    }
    inputChangedPromise = $timeout(function() {
      $scope.stopTyping();
    }, 1500);
    $scope.startTyping();
  };

  // called when the user is typing a message
  // tells the server that the user has
  //   started typing
  $scope.startTyping = function() {
    if (!$scope.typing) {
      socket.emit('start typing');
    }
    $scope.typing = true;
  };

  // called when the user has stopped
  //   typing a message
  // tells the server that the user has
  //   stopped typing
  $scope.stopTyping = function() {
    if ($scope.typing) {
      socket.emit('stop typing');
    }
    $scope.typing = false;
  };

  $scope.redirectToGithub = function() {
    $window.open('http://github.com/amaczugowski/socket-chat');
  }

  // called on page load
  // randomly selects a color for the user
  $scope.selectRandomColor = function() {
    var random = Math.floor(Math.random() * 5);
    switch(random) {
      case 0:
        $scope.selectedColor = 'red';
        break;
      case 1:
        $scope.selectedColor = 'blue';
        break;
      case 2:
        $scope.selectedColor = 'green';
        break;
      case 3:
        $scope.selectedColor = 'orange';
        break;
      default:
        $scope.selectedColor = 'purple';
    }
  };
  $scope.selectRandomColor();

});

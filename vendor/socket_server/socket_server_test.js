var vows = require('vows'),
    assert = require('assert'),
    io = require('socket.io'),
    socketServer = require('./socket_server');

vows.describe('Socket server').addBatch({
  'after calling listen with a public and private port': {
    topic: function() {
      socketServer.listen(8080, 8081, this.callback);
    },

    'after connecting from a socket.io client': {
      topic: function() {
        var socket = new io.Socket('localhost', { port: 8080 });
        socket.connect();
        socket.on('connect', this.callback);
      },

      "connects successfully": function() {
        console.log("RAN");
      }
    }
  }
}).run();
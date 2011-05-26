var vows = require('vows'),
    assert = require('assert'),
    io = require('socket.io'),
    ioClient = require('./vendor/io-client').io,
    socketServer = require('./socket_server'),
    _ = require('./vendor/underscore');

vows.describe('Socket server').addBatch({
  'after calling listen with a public and private port': {
    topic: function() {
      socketServer.listen(8080, 8081, this.callback);
    },

    'after connecting from a socket.io client': {
      topic: function() {
        var socketClient = new ioClient.Socket('localhost', { port: 8080 });
        socketClient.connect();
        socketClient.on('connect', _.bind(function() {
          this.callback(null, socketClient);
        }, this));
      },

      "connects successfully": function(socketClient) {
        console.log(socketClient.sessionId);
        socketClient.disconnect();
        socketServer.close();
      }
    }
  }
}).run();
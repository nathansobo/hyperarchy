var io = require('socket.io'),
    ioClient = require('./io-client').io,
    http = require('http'),
    socketServer = require('../lib/socket_server'),
    agent = require('superagent'),
    redis = require('redis'),
    redisClient = redis.createClient();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000

describe("Socket server", function() {
  var now, publicPort, privatePort, socketClient1, socketClient2, httpClient, privateHost;

  beforeEach(function() {
    publicPort = 8080, privatePort = 8081;
    privateHost = "localhost:" + privatePort.toString();
    socketClient1 = new ioClient.Socket('localhost', { port: publicPort });
    socketClient2 = new ioClient.Socket('localhost', { port: publicPort });
    httpClient = http.createClient(3000, 'localhost');
    now = 0;
    spyOn(socketServer, 'getTime').andCallFake(function() {
      return now;
    });

    waitsFor("redis to be cleared", function(complete) {
      socketServer.clearChannels(complete);
    });
  });

  it("starts before running other specs", function() {
    waitsFor("socket server to start listening", function(listening) {
      socketServer.listen(publicPort, privatePort, true, listening);
    });
  });

  it("allows clients to subscribe to and unsubscribe from channels, only sending them messages when they're subscribed", function() {
    waitsFor("socket clients to connect to server", function(client1Connected, client2Connected) {
      socketClient1.connect();
      socketClient2.connect();
      socketClient1.on('connect', client1Connected);
      socketClient2.on('connect', client2Connected);
    });

    waitsFor("http client to post a channel subscription for the socket client1", function(serverResponded) {
      agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
        form({session_id: socketClient1.sessionId}).
        on('response', function(res) {
          expect(socketServer.numSubscriptions('organizations', 1)).toEqual(1);
          expect(res.statusCode).toEqual(200);
          serverResponded();
        });
    });

    waitsFor("http client to post an event to the channel and client 1 to receive it", function(client1Received, serverResponded, additionalWait) {
      var request = agent.post('http://' + privateHost + '/channel_events/organizations/1').
                          form({message: '"hello"'});
      
      socketClient1.once('message', function(message) {
        expect(JSON.parse(message)).toEqual(['hello']);
        client1Received();
      });

      socketClient2.on('message', function(message) {
        throw new Error("Client 2 should not have received message " +  message);
      });

      setTimeout(function() {
        socketClient2.removeAllListeners('message');
        additionalWait();
      }, 100);
      
      request.on('response', function(res) {
        expect(res.statusCode).toEqual(200);
        serverResponded();
      });
    });

    waitsFor("http client to post a channel subscription for the socket client2", function(serverResponded) {
      var request = agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
                          form({session_id: socketClient2.sessionId});
      request.on('response', function(res) {
        expect(socketServer.numSubscriptions('organizations', 1)).toEqual(2);
        expect(res.statusCode).toEqual(200);
        serverResponded();
      });
    });

    waitsFor("http client to post an event to the channel and both clients to receive it", function(client1Received, client2Received) {
      var request = agent.post('http://' + privateHost + '/channel_events/organizations/1').
                          form({message: '"hello everyone"'});

      socketClient1.once('message', function(message) {
        expect(JSON.parse(message)).toEqual(['hello everyone']);
        client1Received();
      });

      socketClient2.once('message', function(message) {
        expect(JSON.parse(message)).toEqual(['hello everyone']);
        client2Received();
      });
    });

    waitsFor("http client to unsubscribe client 1 from the channel", function(serverResponded) {
      var request = agent.delete('http://' + privateHost + '/channel_subscriptions/organizations/1').
                          form({session_id: socketClient1.sessionId});
      request.on('response', function(res) {
        expect(socketServer.numSubscriptions('organizations', 1)).toEqual(1);
        expect(res.statusCode).toEqual(200);
        serverResponded();
      });
    });

    waitsFor("http client to post an event to the channel and only client 2 to receive it", function(client2Received, serverResponded, additionalWait) {
      var request = agent.post('http://' + privateHost + '/channel_events/organizations/1').
                          form({message: '"goodbye"'});

      socketClient2.once('message', function(message) {
        expect(JSON.parse(message)).toEqual(['goodbye']);
        client2Received();
      });

      socketClient1.on('message', function(message) {
        throw new Error("Client 1 should not have received message " +  message);
      });

      setTimeout(function() {
        socketClient1.removeAllListeners('message');
        additionalWait();
      }, 100);

      request.on('response', function(res) {
        expect(res.statusCode).toEqual(200);
        serverResponded();
      });
    });

    waitsFor("client 2 to disconnect", function(client2Disconnected) {
      socketClient2.disconnect();
      socketClient2.once('disconnect', client2Disconnected);
    });
  });

  it("returns a 500 status when it receives a subscription post for a non-existent session id", function() {
    waitsFor("server to respond with a status of 500", function(serverResponded) {
      var request = agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
                          form({session_id: 'garbage'});
      request.on('response', function(res) {
        expect(res.statusCode).toEqual(500);
        serverResponded();
      });
    });
  });

  it("continues to function properly when a client disconnects (auto-unsubscribes them from channels)", function() {
    waitsFor("socket clients to connect to server", function(client1Connected, client2Connected) {
      socketClient1.connect();
      socketClient2.connect();
      socketClient1.on('connect', client1Connected);
      socketClient2.on('connect', client2Connected);
    });

    waitsFor("http client to post a channel subscription for boths client", function(client1Subscribed, client2Subscribed) {
      agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
        form({session_id: socketClient1.sessionId}).
        on('response', client1Subscribed);
      agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
        form({session_id: socketClient2.sessionId}).
        on('response', client2Subscribed);
    });

    waitsFor("client 1 to disconnect", function(client1Disconnected) {
      expect(socketServer.numSubscriptions('organizations', 1)).toEqual(2);

      socketClient1.disconnect();
      socketClient1.once('disconnect', client1Disconnected);
    });

    waitsFor("disconnected client to be cleaned out of channel", function() {
      return socketServer.numSubscriptions('organizations', 1) == 1;
    });

    waitsFor("client 2 to receive an event as normal", function(client2Received, additionalWait) {
      agent.post('http://' + privateHost + '/channel_events/organizations/1').
            form({message: '"glad you are still connected"'});
      socketClient2.once('message', function(message) {
        expect(JSON.parse(message)).toEqual(["glad you are still connected"]);
        client2Received();
      });

      socketClient1.on('message', function(message) {
        throw new Error("Client 1 should not have received message " +  message);
      });

      setTimeout(function() {
        socketClient1.removeAllListeners('message');
        additionalWait();
      }, 100);
    });
  });

  it("sends the last 15 seconds worth of messages to clients when they connect", function() {
    waitsFor("message 1 to be published", function(complete) {
      agent.post('http://' + privateHost + '/channel_events/organizations/1')
           .form({message: '"message 1"'})
           .on('response', complete)
    });

    runs(function() {
      now += 16000;
    });


    waitsFor("message 2 to be published", function(complete) {
      agent.post('http://' + privateHost + '/channel_events/organizations/1')
           .form({message: '"message 2"'})
           .on('response', complete)
    });

    runs(function() {
      now += 1000;
    });

    waitsFor("message 3 to be published", function(complete) {
      agent.post('http://' + privateHost + '/channel_events/organizations/1')
           .form({message: '"message 3"'})
           .on('response', complete)
    });

    runs(function() {
      now += 1000;
    });

    waitsFor("client to connect", function(connected) {
      socketClient1.connect();
      socketClient1.on('connect', connected)
    });

    waitsFor("client to recieve all messages published in the last 15 seconds", function(messagesReceived) {
      agent.post('http://' + privateHost + '/channel_subscriptions/organizations/1').
        form({session_id: socketClient1.sessionId, reconnecting: 1});

      socketClient1.on("message", function(message) {
        expect(JSON.parse(message)).toEqual(["message 2", "message 3"]);
        messagesReceived();
      });
    });
  });
});

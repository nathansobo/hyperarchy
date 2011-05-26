var http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    _ = require('./vendor/underscore.js');

var private = express.createServer();
private.use(express.bodyParser());

var public = http.createServer();
var socket = io.listen(public);

var channels = {}

function getChannel(type, id) {
  var channelName = type + '/' + id;
  if (!channels[channelName]) channels[channelName] = {};
  return channels[channelName];
}

private.post('/channel_subscriptions/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      sessionId = req.param('session_id');

  console.log("getting subscription request:");
  var client = socket.clients[sessionId]


  if (client) {
    console.log("subscribing ", sessionId, " to channel ", type, id);
    getChannel(type, id)[sessionId] = client;
    res.send(200);
  } else {
    console.log("could not find client with session id ", sessionId);
    res.send(500);
  }
});

private.post('/channel_events/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      message = req.param('message');

  console.log("event on channel ", type, id, "| message: ", message);
  _.each(getChannel(type, id), function(client) {
    console.log('sending to ', client.sessionId);
    client.send(message);
  });
  res.send(200);
});

socket.on('connection', function(client) {
  console.log("client connected ", client.sessionId);

  client.on('disconnect', function() {
    console.log(client.sessionId, ' disconnected');
    _.each(channels, function(channel, channelName) {
      if (!channel[client.sessionId]) return;
      console.log("removing ", client.sessionId, " from channel ", channelName);
      delete channel[client.sessionId];
    });
  });
});

private.listen(8081)
public.listen(8080);

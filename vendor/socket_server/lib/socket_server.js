var https = require('https'),
    http = require('http')
    io = require('socket.io'),
    fs = require('fs'),
    express = require('express'),
    _ = require('./underscore.js');

var private = express.createServer();
private.use(express.bodyParser());

var public, socket;

exports.listen = function(publicPort, privatePort, callback, nonSecure) {
  if (nonSecure) {
    public = http.createServer();
  } else {
    public = https.createServer({
      key: fs.readFileSync('/etc/ssl/private/hyperarchy.key'),
      cert: fs.readFileSync('/etc/ssl/certs/hyperarchy.crt')
    });
  }
  socket = io.listen(public);

  socket.on('connection', function(client) {
    client.on('disconnect', function() {
      _.each(channels, function(channel) {
        delete channel[client.sessionId];
      });
    });
  });

  private.listen(privatePort, '127.0.0.1', function() {
    public.listen(publicPort, callback);
  });
};

// for tests
exports.numSubscriptions = function(type, id) {
  return _.size(getChannel(type, id));
};

var channels = {}
var getChannel = function(type, id) {
  var channelName = type + '/' + id;
  if (!channels[channelName]) channels[channelName] = {};
  return channels[channelName];
};

private.post('/channel_subscriptions/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      sessionId = req.param('session_id');

  var client = socket.clients[sessionId];
  if (client) {
    getChannel(type, id)[sessionId] = client;
    res.send(200);
  } else {
    res.send("No client with session id '" + sessionId + "' found.", 500);
  }
});

private.delete('/channel_subscriptions/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      sessionId = req.param('session_id');
  delete getChannel(type, id)[sessionId];
  res.send(200);
});

private.post('/channel_events/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      message = req.param('message');

  _.each(getChannel(type, id), function(client) {
    client.send(message);
  });
  res.send(200);
});

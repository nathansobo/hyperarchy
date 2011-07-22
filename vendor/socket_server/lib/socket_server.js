var https = require('https'),
    http = require('http'),
    io = require('socket.io'),
    fs = require('fs'),
    express = require('express'),
    _ = require('./underscore.js'),
    redis = require("redis"),
    redisClient = redis.createClient();

var private = express.createServer();
private.use(express.bodyParser());

var public, socket;

exports.listen = function(publicPort, privatePort, nonSecure, callback) {
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

private.post('/channel_subscriptions/:type/:id', function(req, res) {
  var type = req.param('type'),
      id = req.param('id'),
      sessionId = req.param('session_id'),
      reconnecting = req.param('reconnecting');

  var client = socket.clients[sessionId];
  if (client) {
    getChannel(type, id)[sessionId] = client;

    if (reconnecting) {
      redisClient.zrange(getChannelKey(type, id), 0, -1, function(err, messages) {
        client.send('[' + messages.join(', ') + ']');
      });
    }

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

  var timestamp = exports.getTime();
  var channelKey = getChannelKey(type, id);
  redisClient.zadd(channelKey, timestamp, message);
  redisClient.zremrangebyscore(channelKey, '-inf', timestamp - 15000);

  _.each(getChannel(type, id), function(client) {
    client.send("[" + message + "]");
  });
  res.send(200);
});

var channels = {}

function getChannel(type, id) {
  var name = getChannelName(type, id);
  if (!channels[name]) channels[name] = {};
  return channels[name];
};

function getChannelName(type, id) {
  return type + '/' + id;
};

function getChannelKey(type, id) {
  return "channel_events:" + getChannelName(type, id);
};


// for tests
exports.getTime = function() {
  return new Date().getTime();
};

exports.numSubscriptions = function(type, id) {
  return _.size(getChannel(type, id));
};

exports.clearChannels = function(complete) {
  var remaining = _.size(channels);
  if (remaining == 0) return complete();
  _.each(channels, function(channel, name) {
    redisClient.del('channel_events:' + name, function(error, res) {
      if (--remaining == 0) complete();
    });
  });
  channels = {};
};

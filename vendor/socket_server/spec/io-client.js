(function () {

var sys = require('sys'),
    utils = require('socket.io/lib/socket.io/utils'),
    WebSocket = require('socket.io/support/node-websocket-client/lib/websocket').WebSocket,
    EventEmitter = require('events').EventEmitter,
    io = {};

var Socket = io.Socket = function (host, options) {
  this.url = 'ws://' + host + ':' + options.port + '/socket.io/websocket';
  this.open = false;
  this.sessionId = null;
  this._heartbeats = 0;
  this.options = { origin: options.origin || 'http://forbind.net' };
};

Socket.prototype = new EventEmitter;

Socket.prototype.connect = function () {
  var self = this;

  function heartBeat() {
    self.send('~h~' + ++self._heartbeats);
  }

  this.conn = new WebSocket(this.url, 'borf', this.options);

  this.conn.onopen = function () {
    self.open = true;
  };

  this.conn.onmessage = function (event) {
    var messages = utils.decode(event.data);
    if (!self.sessionId) {
      self.sessionId = messages[0];
      self.emit('connect')
      return;
    }

    for (var i = 0; i < messages.length; i++) {
      self.emit('message', messages[i]);
    }
  };

  this.conn.onclose = function () {
    self.emit('disconnect');
    self.open = false;
  };
};

Socket.prototype.send = function (data) {
  if (this.open) {
    this.conn.send(utils.encode(data));
  }
};

Socket.prototype.disconnect = function () {
  if (this.open) {
    this.conn.close();
    this.sessionId = null;
  }
};


this.io = exports.io = io;

})();
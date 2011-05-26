var http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    _ = require('./vendor/underscore.js');


var private = express.createServer();
private.use(express.bodyParser());

var public = http.createServer();
var socket = io.listen(public);

exports.listen = function(publicPort, privatePort, callback) {
  private.listen(privatePort, function() {
    public.listen(publicPort, callback);
  });
};

exports.close = function() {
  private.close();
  public.close();
}
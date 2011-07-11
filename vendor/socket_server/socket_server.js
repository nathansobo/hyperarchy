var socketServer = require('./lib/socket_server');

var noSsl = process.env.NO_SSL;
socketServer.listen(8081, 8082, noSsl);

(function(Monarch, Strophe) {

Monarch.constructor("Monarch.Xmpp.Server", {
  initialize: function() {
    this.connection = new Strophe.Connection("/http-bind/");

    this.connection.addHandler(function(msg) {
      console.debug(msg);
    });
  },

  connect: function() {
    this.connection.connect('localhost', null, function(status) {
      if (status == Strophe.Status.CONNECTING) {
        console.log('Strophe is connecting.');
      } else if (status == Strophe.Status.CONNFAIL) {
        console.log('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
      } else if (status == Strophe.Status.DISCONNECTING) {
        console.log('Strophe is disconnecting.');
      } else if (status == Strophe.Status.DISCONNECTED) {
        console.log('Strophe is disconnected.');
        $('#connect').get(0).value = 'connect';
      } else if (status == Strophe.Status.CONNECTED) {
        console.log('Strophe is connected.');
      }
    });
  },

  send: function(message) {
    this.connection.send(message);
  }
});
  
})(Monarch, Strophe);

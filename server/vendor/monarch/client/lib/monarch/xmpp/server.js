(function(Monarch, Strophe) {

Monarch.constructor("Monarch.Xmpp.Server", {
  initialize: function() {
    this.connection = new Strophe.Connection("/http-bind/");

    this.connection.addHandler(function(msg) {
      console.debug(msg);
    });
  },

  connect: function() {
    var self = this;
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
        Monarch.Xmpp.Templates.Presence.send({to: "app.localhost"});
        Monarch.Xmpp.Templates.Subscribe.send({to: "app.localhost/user_repository"});
      }
    });
  },

  send: function(message) {
    this.connection.send(message);
  },

  jid: function() {
    return this.connection.jid;
  }
});
  
})(Monarch, Strophe);

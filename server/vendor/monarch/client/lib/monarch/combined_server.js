(function(Monarch) {

Monarch.constructor("Monarch.CombinedServer", {
  constructor_initialize: function() {
    this.delegate('fetch', 'create', 'update', 'destroy', 'get', 'put', 'post', 'delete', 'http_server');
    this.delegate('subscribe', 'send', 'jid', 'xmpp_server');
  },

  initialize: function() {
    this.http_server = new Monarch.Http.Server();
    this.xmpp_server = new Monarch.Xmpp.Server();
  }
});

})(Monarch);

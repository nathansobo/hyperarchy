(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.Templates.Discovery", Monarch.Xmpp.Templates.Iq, {
  query: function(attributes) {
    this.builder.tag('query', {
      xmlns: "http://jabber.org/protocol/disco#items"
    });
  },

  type: 'get'
});

})(Monarch);

(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.Templates.Subscribe", Monarch.Xmpp.Templates.Iq, {
  query: function(attributes) {
    this.builder.tag('subscribe', {
      xmlns: 'hyperarchy.org'
    });
  },

  type: 'put'
});

})(Monarch);

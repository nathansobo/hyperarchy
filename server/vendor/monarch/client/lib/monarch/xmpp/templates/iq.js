(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Xmpp.Templates.Iq", Monarch.Xmpp.Template, {
  constructor_properties: {
    id_counter: 1,

    next_id: function() {
      return this.id_counter++;
    }
  },

  content: function(attributes) { with (this.builder) {
    iq({ xmlns: 'jabber:client', from: XmppServer.jid(), to: attributes.to, type: template.type, id: this.constructor.next_id() }, function() {
      template.query(attributes);
    });
  }}
});

})(Monarch, jQuery);

(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Xmpp.Templates.Iq", Monarch.Xmpp.Template, {
  content: function(attributes) { with (this.builder) {
    iq({ xmlns: 'jabber:client', from: XmppServer.jid(), to: attributes.to }, function() {
      template.query(attributes);
    });
  }}
});

})(Monarch, jQuery);

(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Xmpp.Presence", Monarch.Xmpp.Template, {
  content: function(attributes) { with (this.builder) {
    presence({
      xmlns: 'jabber:client',
      from: XmppServer.jid(),
      to: attributes.to,
      type: attributes.type,
      session_id: jQuery.cookie("_session_id")
    });
  }}
});

})(Monarch, jQuery);

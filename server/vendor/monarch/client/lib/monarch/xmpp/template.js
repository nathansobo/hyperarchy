(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.Template", Monarch.Xml.Template, {
  builder_constructor: Monarch.Xmpp.Builder,

  constructor_properties: {
    send: function(properties) {
      XmppServer.send(this.to_jquery(properties));
    }
  }
});

})(Monarch);

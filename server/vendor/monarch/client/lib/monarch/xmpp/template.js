(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.Template", Monarch.Xml.Template, {
  builder_constructor: Monarch.Xmpp.Builder,

  constructor_properties: {
    send: function(properties) {
      Server.send(this.to_jquery(properties)[0]);
    }
  }
});

})(Monarch);

(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.Builder", Monarch.Xml.Builder, {
  constructor_properties: {
    supported_tags: [
      "iq", "message", "presence", "show", "status", "body", "active", "composing", "paused", "query"
    ]
  },

  open_tag_instruction_constructor: Monarch.Xmpp.OpenTag
})

})(Monarch);

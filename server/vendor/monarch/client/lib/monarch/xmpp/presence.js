(function(Monarch, jQuery) {

constructor("Monarch.Xmpp.Presence", Xmpp.Template, {
  content: function(attributes) { with (this.builder) {

    presence({to: attributes.to})


  }}
});

})(Monarch, jQuery);

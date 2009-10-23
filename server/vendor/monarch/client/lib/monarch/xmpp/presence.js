(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Xmpp.Presence", Monarch.Xmpp.Template, {
  content: function(attributes) { with (this.builder) {
    presence({to: attributes.to, session_id: jQuery.cookie("__session_id")});
  }}
});

})(Monarch, jQuery);

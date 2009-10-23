(function(Monarch) {

Monarch.constructor("Monarch.Xmpp.OpenTag", Monarch.Xml.OpenTag, {
  to_xml: function() {
    return "<" + this.name + ' _realname="' + this.name  + '" ' + this.attributes_html() + ">"
  }
});

})(Monarch);

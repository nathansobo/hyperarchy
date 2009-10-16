(function(Monarch) {

Monarch.constructor("Monarch.Xml.TextNode", {
  initialize: function(text) {
    this.text = text;
  },

  to_xml: function() {
    return htmlEscape(this.text);
  },

  post_process: function() {
  }
});

})(Monarch);

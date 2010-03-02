(function(Monarch) {

Monarch.constructor("Monarch.View.TextNode", {
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

constructor("View.TextNode", {
  initialize: function(text) {
    this.text = text;
  },

  to_html: function() {
    return htmlEscape(this.text);
  }
});
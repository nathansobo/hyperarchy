(function(Monarch) {

Monarch.constructor("Monarch.View.TextNode", {
  initialize: function(text) {
    this.text = text;
  },

  toXml: function() {
    return htmlEscape(this.text);
  },

  postProcess: function() {
  }
});

})(Monarch);

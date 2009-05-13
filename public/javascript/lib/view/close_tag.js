constructor("View.CloseTag", {
  initialize: function(name) {
    this.name = name;
  },

  to_html: function() {
    return "</" + this.name + ">"
  }
});

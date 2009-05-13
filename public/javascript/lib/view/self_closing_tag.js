constructor("View.SelfClosingTag", View.OpenTag, {
  to_html: function() {
    return "<" + this.name + this.attributes_html() + "/>"
  }
});
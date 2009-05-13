constructor("View.SelfClosingTag", View.CloseTag.prototype, View.OpenTag.prototype, {
  to_html: function() {
    return "<" + this.name + this.attributes_html() + "/>"
  },

  post_process: function(builder) {
    builder.push_child();
    builder.pop_child();
    this.on_build_node.publish(builder.find_preceding_element(), builder.view);
  }
});
constructor("Xml.SelfClosingTag", Xml.CloseTag.prototype, Xml.OpenTag.prototype, {
  to_xml: function() {
    return "<" + this.name + this.attributes_html() + "/>"
  },

  post_process: function(builder) {
    builder.push_child();
    builder.pop_child();
    if (this.on_build_node) this.on_build_node.publish(builder.find_preceding_element(), builder.jquery_fragment);
  }
});

(function(Monarch) {

Monarch.constructor("Monarch.View.SelfClosingTag", Monarch.View.CloseTag.prototype, Monarch.View.OpenTag.prototype, {
  to_xml: function() {
    return "<" + this.name + this.attributes_html() + "/>"
  },

  post_process: function(builder) {
    builder.push_child();
    builder.pop_child();
    if (this.on_build_node) this.on_build_node.publish(builder.find_preceding_element(), builder.jquery_fragment);
  }
});

})(Monarch);

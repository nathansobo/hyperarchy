constructor("View.CloseTag", {
  initialize: function(name) {
    this.name = name;
  },

  to_html: function() {
    return "</" + this.name + ">"
  },
  
  on_build: function(handler) {
    if (!this.on_build_node) this.on_build_node = new June.SubscriptionNode();
    return this.on_build_node.subscribe(handler);
  },

  post_process: function(builder) {
    builder.pop_child();
    this.on_build_node.publish(builder.find_preceding_element(), builder.view);
  }
});

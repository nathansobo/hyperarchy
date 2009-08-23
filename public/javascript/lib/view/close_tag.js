constructor("View.CloseTag", {
  constructor_properties: {
    initialize: function() {
      this.generate_event_methods();
    },

    supported_events: [
      "blur", "change", "click", "dblclick", "error", "focus", "keydown", "keypress",
      "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
      "resize", "scroll", "select", "submit", "unload"
    ],

    generate_event_methods: function() {
      var self = this;
      Util.each(this.supported_events, function(event_name) {
        self.generate_event_method(event_name);
      });
    },

    generate_event_method: function(event_name) {
      this.prototype[event_name] = function(handler) {
        this.on_build(function(element, view) {
          element[event_name].call(element, function(event) {
            handler.call(element, view, event);
          });
        });
      };
    }
  },

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
    if (this.on_build_node) this.on_build_node.publish(builder.find_preceding_element(), builder.view);
  }
});

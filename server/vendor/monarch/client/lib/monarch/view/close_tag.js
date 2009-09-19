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
      this.prototype[event_name] = function(callback) {
        this.on_build(function(element, view) {
          element[event_name].call(element, function(event) {
            callback.call(element, view, event);
          });
        });
        return this;
      };
    }
  },

  initialize: function(name) {
    this.name = name;
  },

  to_html: function() {
    return "</" + this.name + ">"
  },

  bind: function(name) {
    this.on_build(function(element, view) {
      view[name] = element;
    });
    return this;
  },

  on_build: function(callback) {
    if (!this.on_build_node) this.on_build_node = new SubscriptionNode();
    return this.on_build_node.subscribe(callback);
  },

  post_process: function(builder) {
    builder.pop_child();
    if (this.on_build_node) this.on_build_node.publish(builder.find_preceding_element(), builder.view);
  }
});

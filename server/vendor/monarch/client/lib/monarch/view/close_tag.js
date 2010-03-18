(function(Monarch) {

Monarch.constructor("Monarch.View.CloseTag", {
  constructorProperties: {
    initialize: function() {
      this.generateEventMethods();
    },

    supportedEvents: [
      "blur", "change", "click", "dblclick", "error", "focus", "keydown", "keypress",
      "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
      "resize", "scroll", "select", "submit", "unload"
    ],

    generateEventMethods: function() {
      _.each(this.supportedEvents, function(eventName) {
        this.generateEventMethod(eventName);
      }, this);
    },

    generateEventMethod: function(eventName) {
      this.prototype[eventName] = function(callback) {
        this.onBuild(function(element, view) {
          element[eventName].call(element, function(event) {
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

  toXml: function() {
    return "</" + this.name + ">"
  },

  ref: function(name) {
    this.onBuild(function(element, view) {
      view[name] = element;
    });
    return this;
  },

  onBuild: function(callback, context) {
    if (!this.onBuildNode) this.onBuildNode = new Monarch.SubscriptionNode();
    return this.onBuildNode.subscribe(callback, context);
  },

  postProcess: function(builder) {
    builder.popChild();
    if (this.onBuildNode) this.onBuildNode.publish(builder.findPrecedingElement(), builder.jqueryFragment);
  }
});

})(Monarch);

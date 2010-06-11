(function(Monarch) {

_.constructor("Monarch.View.CloseTag", {
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
      this.prototype[eventName] = function() {
        var args = _.toArray(arguments);
        var callbackOrMethodName = _.first(args);
        var callback = _.isFunction(callbackOrMethodName) ? callbackOrMethodName : null;
        var boundArgs = _.rest(args);

        this.onBuild(function(element, view) {
          element[eventName].call(element, function(event) {
            if (callback) {
              return callback.call(element, view, event);
            } else {
              return view[callbackOrMethodName].apply(view, boundArgs.concat([element, event]));
            }
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

  showsView: function(viewName) {
    this.click(function() {
      jQuery.bbq.pushState({view: viewName});
      return false;
    });
  },

  hide: function() {
    this.onBuild(function(element) {
      element.hide();
    });
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

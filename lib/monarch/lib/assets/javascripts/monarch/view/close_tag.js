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
        args.unshift(eventName)
        this.bind.apply(this, args);
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

  bind: function() {
    var args = _.toArray(arguments);
    if (args.length === 1 && _.isObject(args[0])) {
      _.each(args[0], function(handler, eventType) {
        this.bind(eventType, handler);
      }, this)
      return this;
    }

    var lastArg = _.last(args);
    
    this.onBuild(function(element, view) {
      var outerHandler = function(event, completionFunctionOrHash) {

        var innerHandler = _.isFunction(lastArg) ? lastArg : view[lastArg];
        var promise = innerHandler.call(view, event, element);
        if (completionFunctionOrHash) {
          if (_.isFunction(completionFunctionOrHash)) {
            promise.success(completionFunctionOrHash);
          } else {
            _.each(completionFunctionOrHash, function(callback, eventType) {
              promise[eventType](callback);
            });
          }
        }
      };

      args[args.length - 1] = outerHandler;
      element.bind.apply(element, args);
    });

    return this;
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

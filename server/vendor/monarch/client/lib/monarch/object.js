(function(Monarch) {

Monarch.constructor("Monarch.ModuleSystem.Object", {
  constructorProperties: {
    delegateConstructorMethods: function() {
      var args = _.toArray(arguments);
      var delegateName = args.pop();

      var newConstructorMethods = {};
      this.setupDelegateMethods(newConstructorMethods, args, delegateName);
      if (!this.prototype.constructorProperties) this.prototype.constructorProperties = {};
      Monarch.Util.extend(this.prototype.constructorProperties, newConstructorMethods);
      Monarch.Util.extend(this, newConstructorMethods);
    },

    delegate: function(source) {
      var args = _.toArray(arguments);
      var delegateName = args.pop();
      this.setupDelegateMethods(this.prototype, args, delegateName);
    },

    setupDelegateMethods: function(delegator, methodNames, delegateName) {
      _.each(methodNames, function(methodName) {
        delegator[methodName] = function() {
          var delegate = this[delegateName];
          return delegate[methodName].apply(delegate, arguments);
        };
      });
    }
  },

  hitch: function() {
    var args = _.toArray(arguments);
    var methodName = args.shift();
    var bindArgs = [this].concat(args);
    var method = this[methodName]; 
    return method.bind.apply(method, bindArgs);
  }
});

})(Monarch);

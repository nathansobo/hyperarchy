(function(Monarch) {

Monarch.constructor("Monarch.ModuleSystem.Object", {
  constructor_properties: {
    delegate_constructor_methods: function() {
      var args = Monarch.Util.to_array(arguments);
      var delegate_name = args.pop();

      var new_constructor_methods = {};
      this.setup_delegate_methods(new_constructor_methods, args, delegate_name);
      if (!this.prototype.constructor_properties) this.prototype.constructor_properties = {};
      Monarch.Util.extend(this.prototype.constructor_properties, new_constructor_methods);
      Monarch.Util.extend(this, new_constructor_methods);
    },

    delegate: function(source) {
      var args = Monarch.Util.to_array(arguments);
      var delegate_name = args.pop();
      this.setup_delegate_methods(this.prototype, args, delegate_name);
    },

    setup_delegate_methods: function(delegator, method_names, delegate_name) {
      Monarch.Util.each(method_names, function(method_name) {
        delegator[method_name] = function() {
          var delegate = this[delegate_name];
          return delegate[method_name].apply(delegate, arguments);
        };
      });
    }
  },

  hitch: function() {
    var args = _.toArray(arguments);
    var method_name = args.shift();
    var bind_args = [this].concat(args);
    var method = this[method_name]; 
    return method.bind.apply(method, bind_args);
  }
});

})(Monarch);

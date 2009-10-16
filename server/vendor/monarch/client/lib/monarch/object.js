(function(Monarch) {

Monarch.constructor("Monarch.ModuleSystem.Object", {
  constructor_properties: {
    delegate_constructor_methods: function() {
      var args = Monarch.Util.to_array(arguments);
      var delegate_name = args.pop();
      this.setup_delegate_methods(this, args, delegate_name);
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
  }
});

})(Monarch);

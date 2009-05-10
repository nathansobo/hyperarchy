ModuleSystem = {
  constructor: function(qualified_constructor_name, prototype_properties) {
    var constructor_name = qualified_constructor_name.split(".").pop();
    var containing_module = this.create_module_containing_constructor(qualified_constructor_name);

    constructor = function() {
    }
    this.mixin(constructor.prototype, prototype_properties);
    return containing_module[constructor_name] = constructor;
  },

  module: function(qualified_module_name, properties) {
    var module = this.create_module_path(qualified_module_name.split("."));
    this.mixin(module, properties);
    return module;
  },

  mixin: function(target, module) {
    for (var prop in module) {
      if (target[prop] == "prototype") continue;
      target[prop] = module[prop];
    }
    return target;
  },

  create_module_containing_constructor: function(qualified_constructor_name) {
    var qualified_constructor_path = qualified_constructor_name.split(".");
    var containing_module_path = qualified_constructor_path.slice(0, qualified_constructor_path.length - 1);
    return this.create_module_path(containing_module_path);
  },

  create_module_path: function(path) {
    var current_module = window;
    for (var i = 0; i < path.length; ++i) {
      var path_fragment = path[i];
      if (!current_module[path_fragment]) current_module[path_fragment] = {};
      current_module = current_module[path_fragment];
    }
    return current_module;
  }
}
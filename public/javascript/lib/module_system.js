ModuleSystem = {
  module: function(qualified_module_name, attributes) {
    var module = this.create_module_path(qualified_module_name);
    this.mixin(module, attributes);
  },

  mixin: function(target, module) {
    for (var prop in module) {
      if (target[prop] == "prototype") continue;
      target[prop] = module[prop];
    }
    return target;
  },

  resolve_qualified_module_name: function(qualified_module_name) {
    var path = qualified_module_name.split(".");
    var current_module = window;
    for (var i = 0; i < path.length; i++) {
      var path_fragment = path[i];
      if (!current_module[path_fragment]) return false;
      current_module = current_module[path_fragment];
    }
    return current_module;
  },

  create_module_path: function(qualified_module_name) {
    var path = qualified_module_name.split(".");
    var current_module = window;
    for (var i = 0; i < path.length; ++i) {
      var path_fragment = path[i];
      if (!current_module[path_fragment]) current_module[path_fragment] = {};
      current_module = current_module[path_fragment];
    }
    return current_module;
  }
}
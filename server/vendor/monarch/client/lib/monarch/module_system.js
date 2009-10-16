Monarch = {
  constructor: function() {
    Monarch.ModuleSystem.constructor.apply(Monarch.ModuleSystem, arguments);
  },

  module: function() {
    Monarch.ModuleSystem.module.apply(Monarch.ModuleSystem, arguments);
  }
};

(function(Monarch) {
Monarch.ModuleSystem = {
  constructor: function() {
    var constructor_basename, containing_module;
    var args = this.extract_constructor_arguments(arguments);

    if (args.qualified_constructor_name) {
      constructor_basename = args.qualified_constructor_name.split(".").pop();
      containing_module = this.create_module_containing_constructor(args.qualified_constructor_name);
    }

    var constructor = function() {
      if (this.initialize && !constructor.__initialize_disabled__) this.initialize.apply(this, arguments);
    }

    if (constructor_basename) constructor.basename = constructor_basename;

    if (args.superconstructor) {
      this.extend(args.superconstructor, constructor);
    } else if (Monarch.ModuleSystem.Object) {
      this.extend(Monarch.ModuleSystem.Object, constructor);
    }

    for(var i = 0; i < args.mixin_modules.length; i++) {
      this.mixin(constructor.prototype, args.mixin_modules[i]);
    }

    if (constructor.prototype.constructor_initialize) {
      if (!constructor.prototype.constructor_properties) constructor.prototype.constructor_properties = {};
      constructor.prototype.constructor_properties.initialize = constructor.prototype.constructor_initialize;
      delete constructor.prototype.constructor_initialize;
    }
    if (constructor.prototype.constructor_properties) {
      this.mixin(constructor, constructor.prototype.constructor_properties);
    }

    if (constructor_basename) containing_module[constructor_basename] = constructor;

    if (args.superconstructor && args.superconstructor.extended) args.superconstructor.extended(constructor);
    if (constructor.initialize) constructor.initialize();

    return constructor;
  },

  module: function(qualified_module_name, properties) {
    var module = this.create_module_path(qualified_module_name.split("."));
    this.mixin(module, properties);
    return module;
  },

  extend: function(superconstructor, subconstructor) {
    var original_subconstructor_prototype = subconstructor.prototype;
    try {
      superconstructor.__initialize_disabled__ = true;
      subconstructor.prototype = new superconstructor();
    } finally {
      superconstructor.__initialize_disabled__ = false;
    }

    if (superconstructor.prototype.constructor_properties) {
      subconstructor.prototype.constructor_properties = this.clone(superconstructor.prototype.constructor_properties);
    }
    subconstructor.prototype.constructor = subconstructor;
    this.mixin(subconstructor.prototype, original_subconstructor_prototype);
    return subconstructor;
  },

  clone: function(object) {
    return this.mixin({}, object);
  },

  mixin: function(target, module) {
    for (var prop in module) {
      if (prop == "constructor") continue;
      if (prop == "constructor_properties" && target.constructor_properties) {
        this.mixin(target.constructor_properties, module.constructor_properties);
        continue;
      }
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
  },

  extract_constructor_arguments: function(args) {
    var args = Array.prototype.slice.call(args, 0);

    var constructor_arguments = {
      mixin_modules: []
    };

    for(var i = 0; i < args.length; i++) {
      var current_arg = args[i];
      if (typeof current_arg == "string") {
        constructor_arguments.qualified_constructor_name = current_arg;
      } else if (typeof current_arg == "function") {
        constructor_arguments.superconstructor = current_arg;
      } else {
        constructor_arguments.mixin_modules.push(current_arg);
      }
    }
    return constructor_arguments;
  }
};

})(Monarch);

function constructor() {
  ModuleSystem.constructor.apply(ModuleSystem, arguments);
}

function module() {
  ModuleSystem.module.apply(ModuleSystem, arguments);
}

function mixin() {
  ModuleSystem.mixin.apply(ModuleSystem, arguments);
}

ModuleSystem = {
  constructor: function() {
    var args = this.extract_constructor_arguments(arguments);
    var constructor_basename = args.qualified_constructor_name.split(".").pop();
    var containing_module = this.create_module_containing_constructor(args.qualified_constructor_name);
    var constructor = function() {
      if (this.initialize) this.initialize.apply(this, arguments);
    }

    if (args.superconstructor) this.extend(args.superconstructor, constructor);
    
    for(var i = 0; i < args.mixin_modules.length; i++) {
      this.mixin(constructor.prototype, args.mixin_modules[i]);
    }

    if (constructor.prototype.eigenprops) {
      this.mixin(constructor, constructor.prototype.eigenprops);
      if (constructor.initialize) constructor.initialize();
    }

    return containing_module[constructor_basename] = constructor;
  },

  module: function(qualified_module_name, properties) {
    var module = this.create_module_path(qualified_module_name.split("."));
    this.mixin(module, properties);
    return module;
  },

  extend: function(superconstructor, subconstructor) {
    var original_subconstructor_prototype = subconstructor.prototype;
    subconstructor.prototype = new superconstructor();
    if (superconstructor.prototype.eigenprops) {
      subconstructor.prototype.eigenprops = this.clone(superconstructor.prototype.eigenprops);
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
      if (target[prop] == "prototype") continue;
      if (prop == "eigenprops" && target.eigenprops) {
        this.mixin(target.eigenprops, module.eigenprops);
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
    var args = Util.to_array(args);
    var constructor_arguments = {
      qualified_constructor_name: args.shift(),
      mixin_modules: []
    };

    for(var i = 0; i < args.length; i++) {
      var current_arg = args[i];
      if (typeof current_arg == "function") {
        constructor_arguments.superconstructor = current_arg;
      } else {
        constructor_arguments.mixin_modules.push(current_arg);
      }
    }
    return constructor_arguments;
  }
}
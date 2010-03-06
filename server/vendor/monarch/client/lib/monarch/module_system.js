Monarch = {};

(function(Monarch) {

Monarch.constructor = function() {
  Monarch.ModuleSystem.constructor.apply(Monarch.ModuleSystem, arguments);
};

Monarch.module = function() {
  Monarch.ModuleSystem.module.apply(Monarch.ModuleSystem, arguments);
};

Monarch.ModuleSystem = {
  constructor: function() {
    var constructorBasename, containingModule;
    var args = this.extractConstructorArguments(arguments);

    if (args.qualifiedConstructorName) {
      constructorBasename = args.qualifiedConstructorName.split(".").pop();
      containingModule = this.createModuleContainingConstructor(args.qualifiedConstructorName);
    }

    var constructor = function() {
      if (this.initialize && !constructor._initializeDisabled_) this.initialize.apply(this, arguments);
    }

    if (constructorBasename) constructor.basename = constructorBasename;

    if (args.superconstructor) {
      this.extend(args.superconstructor, constructor);
    } else if (Monarch.ModuleSystem.Object) {
      this.extend(Monarch.ModuleSystem.Object, constructor);
    }

    for(var i = 0; i < args.mixinModules.length; i++) {
      this.mixin(constructor.prototype, args.mixinModules[i]);
    }

    if (constructor.prototype.constructorInitialize) {
      if (!constructor.prototype.constructorProperties) constructor.prototype.constructorProperties = {};
      constructor.prototype.constructorProperties.initialize = constructor.prototype.constructorInitialize;
      delete constructor.prototype.constructorInitialize;
    }
    if (constructor.prototype.constructorProperties) {
      this.mixin(constructor, constructor.prototype.constructorProperties);
    }

    if (constructorBasename) containingModule[constructorBasename] = constructor;

    if (args.superconstructor && args.superconstructor.extended) args.superconstructor.extended(constructor);
    if (constructor.initialize) constructor.initialize();

    return constructor;
  },

  module: function(qualifiedModuleName, properties) {
    var module = this.createModulePath(qualifiedModuleName.split("."));
    this.mixin(module, properties);
    return module;
  },

  extend: function(superconstructor, subconstructor) {
    var originalSubconstructorPrototype = subconstructor.prototype;
    try {
      superconstructor._initializeDisabled_ = true;
      subconstructor.prototype = new superconstructor();
    } finally {
      superconstructor._initializeDisabled_ = false;
    }

    if (superconstructor.prototype.constructorProperties) {
      subconstructor.prototype.constructorProperties = this.clone(superconstructor.prototype.constructorProperties);
    }
    subconstructor.prototype.constructor = subconstructor;
    this.mixin(subconstructor.prototype, originalSubconstructorPrototype);
    return subconstructor;
  },

  clone: function(object) {
    return this.mixin({}, object);
  },

  mixin: function(target, module) {
    for (var prop in module) {
      if (prop == "constructor") continue;
      if (prop == "constructorProperties" && target.constructorProperties) {
        this.mixin(target.constructorProperties, module.constructorProperties);
        continue;
      }
      target[prop] = module[prop];
    }
    return target;
  },

  createModuleContainingConstructor: function(qualifiedConstructorName) {
    var qualifiedConstructorPath = qualifiedConstructorName.split(".");
    var containingModulePath = qualifiedConstructorPath.slice(0, qualifiedConstructorPath.length - 1);
    return this.createModulePath(containingModulePath);
  },

  createModulePath: function(path) {
    var currentModule = window;
    for (var i = 0; i < path.length; ++i) {
      var pathFragment = path[i];
      if (!currentModule[pathFragment]) currentModule[pathFragment] = {};
      currentModule = currentModule[pathFragment];
    }
    return currentModule;
  },

  extractConstructorArguments: function(args) {
    var args = Array.prototype.slice.call(args, 0);

    var constructorArguments = {
      mixinModules: []
    };

    for(var i = 0; i < args.length; i++) {
      var currentArg = args[i];
      if (typeof currentArg == "string") {
        constructorArguments.qualifiedConstructorName = currentArg;
      } else if (typeof currentArg == "function") {
        constructorArguments.superconstructor = currentArg;
      } else {
        constructorArguments.mixinModules.push(currentArg);
      }
    }
    return constructorArguments;
  }
};

})(Monarch);

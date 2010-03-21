//(function(_) {

var permittedAttrAccessorDefinitionKeys = ["reader", "writer", "afterWrite", "afterChange"];


_.mixin({
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
      this.inherit(args.superconstructor, constructor);
    } else if (_.Object) {
      this.inherit(_.Object, constructor);
    }

    for(var i = 0; i < args.imbueModules.length; i++) {
      this.imbue(constructor.prototype, args.imbueModules[i]);
    }

    if (constructor.prototype.constructorInitialize) {
      if (!constructor.prototype.constructorProperties) constructor.prototype.constructorProperties = {};
      constructor.prototype.constructorProperties.initialize = constructor.prototype.constructorInitialize;
      delete constructor.prototype.constructorInitialize;
    }
    if (constructor.prototype.constructorProperties) {
      this.imbue(constructor, constructor.prototype.constructorProperties);
    }

    if (constructorBasename) containingModule[constructorBasename] = constructor;

    if (args.superconstructor && args.superconstructor.inherited) args.superconstructor.inherited(constructor);
    if (constructor.initialize) constructor.initialize();

    return constructor;
  },

  module: function(qualifiedModuleName, properties) {
    var module = this.createModulePath(qualifiedModuleName.split("."));
    this.imbue(module, properties);
    return module;
  },

  inherit: function(superconstructor, subconstructor) {
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
    this.imbue(subconstructor.prototype, originalSubconstructorPrototype);
    return subconstructor;
  },

  imbue: function(target, module) {
    if (!module) throw new Error("Module is null");
    this.defineAttrAccessors(module);
    for (var prop in module) {
      if (prop == "constructor") continue;
      if (prop == "constructorProperties" && target.constructorProperties) {
        this.extend(target.constructorProperties, module.constructorProperties);
        continue;
      }
      if (this.isAttrAccessorDefinition(module[prop])) this.defineAttrAccessor(module, prop);

      target[prop] = module[prop];
    }
    return target;
  },

  defineAttrAccessors: function(module) {
    if (module.attrAccessors) {
      var attrAccessors = module.attrAccessors;
      delete module.attrAccessors;
      _.each(attrAccessors, function(attrName) {
        module[attrName] = this.buildAttrAccessor(attrName)
      }, this);
    }
  },

  isAttrAccessorDefinition: function(value) {
    if (typeof value !== "object") return false;
    if (_.isEmpty(value)) return false;
    return _.all(_.keys(value), function(key) {
      return _.include(permittedAttrAccessorDefinitionKeys, key)
    });
  },

  defineAttrAccessor: function(module, name) {
    var definition = module[name];
    module[name] = this.buildAttrAccessor(name, definition.reader, definition.writer, definition.afterWrite, definition.afterChange);
  },

  buildAttrAccessor: function(name, reader, writer, afterWriteHook, afterChangeHook) {
    var fieldName = "_" + name;
    if (!reader) reader = function() { return this[fieldName]; };
    if (!writer) writer = function(value) { this[fieldName] = value; };

    return function(value) {
      if (arguments.length == 0) {
        return reader.call(this);
      } else {
        var oldValue = this[fieldName];
        var newValue = writer.call(this, value) || this[fieldName];
        if (afterWriteHook) afterWriteHook.call(this, newValue, oldValue);
        if (afterChangeHook && newValue !== oldValue) afterChangeHook.call(this, newValue, oldValue);
        return newValue;
      }
    };
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
      imbueModules: []
    };

    for(var i = 0; i < args.length; i++) {
      var currentArg = args[i];
      if (typeof currentArg == "string") {
        constructorArguments.qualifiedConstructorName = currentArg;
      } else if (typeof currentArg == "function") {
        constructorArguments.superconstructor = currentArg;
      } else {
        constructorArguments.imbueModules.push(currentArg);
      }
    }
    return constructorArguments;
  }
});

_.constructor("_.Object", {
  constructorProperties: {
    delegateConstructorMethods: function() {
      var args = _.toArray(arguments);
      var delegateName = args.pop();

      var newConstructorMethods = {};
      this.setupDelegateMethods(newConstructorMethods, args, delegateName);
      if (!this.prototype.constructorProperties) this.prototype.constructorProperties = {};
      _.extend(this.prototype.constructorProperties, newConstructorMethods);
      _.extend(this, newConstructorMethods);
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

//})(_);

(function(_) {

_.mixin({
  constructor: function() {
    var constructorBasename, containingModule;
    var args = extractConstructorArguments(arguments);

    if (args.qualifiedConstructorName) {
      constructorBasename = args.qualifiedConstructorName.split(".").pop();
      containingModule = createModuleContainingConstructor(args.qualifiedConstructorName);
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

    _.each(args.imbueModules, function(module) {
      _.imbue(constructor.prototype, module);
    });

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
    var module = createModulePath(qualifiedModuleName.split("."));
    this.imbue(module, properties);
    return module;
  },

  inherit: function(superconstructor, subconstructor) {
    var originalSubconstructorPrototype = subconstructor.prototype;
    try {
      superconstructor._initializeDisabled_ = true;
      subconstructor.prototype = new superconstructor();
    } finally {
      delete superconstructor._initializeDisabled_; 
    }

    if (superconstructor.prototype.constructorProperties) {
      subconstructor.prototype.constructorProperties = _.clone(superconstructor.prototype.constructorProperties);
    }
    subconstructor.prototype.constructor = subconstructor;
    this.imbue(subconstructor.prototype, originalSubconstructorPrototype);
    return subconstructor;
  },

  imbue: function(target, source) {
    if (!target) throw new Error("Target module or constructor is null");
    if (!source) throw new Error("Source module is null");
    defineAttrAccessors(source);

    _.each(source, function(value, key) {
      if (key == "constructor") return;
      if (key == "constructorProperties" && target.constructorProperties) {
        _.extend(target.constructorProperties, source.constructorProperties);
        return;
      }
      target[key] = value;
    });
    
    return target;
  }
});

var permittedAttrAccessorDefinitionKeys = ["reader", "writer", "afterWrite", "afterChange"];

function defineAttrAccessors(module) {
  if (module.attrAccessors) {
    var attrAccessors = module.attrAccessors;
    delete module.attrAccessors;
    _.each(attrAccessors, function(attrName) {
      if (module[attrName] === undefined) module[attrName] = buildAttrAccessor(attrName)
    }, this);
  }
  _.each(module, function(value, key) {
    if (isAttrAccessorDefinition(value)) {
      module[key] = buildAttrAccessor(key, value.reader, value.writer, value.afterWrite, value.afterChange);
    }
  });
}

function isAttrAccessorDefinition(value) {
  if (typeof value !== "object") return false;
  if (_.isEmpty(value)) return false;
  return _.all(_.keys(value), function(key) {
    return _.include(permittedAttrAccessorDefinitionKeys, key)
  });
}

function buildAttrAccessor(name, reader, writer, afterWriteHook, afterChangeHook) {
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
}

function createModuleContainingConstructor(qualifiedConstructorName) {
  var qualifiedConstructorPath = qualifiedConstructorName.split(".");
  var containingModulePath = qualifiedConstructorPath.slice(0, qualifiedConstructorPath.length - 1);
  return createModulePath(containingModulePath);
}

function createModulePath(path) {
  var currentModule = window;
  _.each(path, function(pathFragment) {
    if (!currentModule[pathFragment]) currentModule[pathFragment] = {};
    currentModule = currentModule[pathFragment];
  });
  return currentModule;
}

function extractConstructorArguments(args) {
  var constructorArguments = {
    imbueModules: []
  };

  _.each(args, function(currentArg) {
    if (_.isString(currentArg)) {
      constructorArguments.qualifiedConstructorName = currentArg;
    } else if (_.isFunction(currentArg)) {
      constructorArguments.superconstructor = currentArg;
    } else {
      constructorArguments.imbueModules.push(currentArg);
    }
  });

  return constructorArguments;
}

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

})(_);

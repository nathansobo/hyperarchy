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

    _.each(args.mixins, function(module) {
      _.addMethods(constructor.prototype, module);
    });

    if (constructor.prototype.constructorInitialize) {
      if (!constructor.prototype.constructorProperties) constructor.prototype.constructorProperties = {};
      constructor.prototype.constructorProperties.initialize = constructor.prototype.constructorInitialize;
      delete constructor.prototype.constructorInitialize;
    }
    if (constructor.prototype.constructorProperties) {
      this.addMethods(constructor, constructor.prototype.constructorProperties);
    }

    if (constructorBasename) containingModule[constructorBasename] = constructor;

    if (args.superconstructor && args.superconstructor.inherited) args.superconstructor.inherited(constructor);
    if (constructor.initialize) constructor.initialize();

    return constructor;
  },

  module: function(qualifiedModuleName, properties) {
    var module = createModulePath(qualifiedModuleName.split("."));
    this.addMethods(module, properties);
    return module;
  },

  inherit: function(superconstructor, subconstructor) {
    var originalSubconstructorPrototype = subconstructor.prototype;
    try {
      superconstructor._initializeDisabled_ = true;
      subconstructor.superconstructor = superconstructor;
      subconstructor.prototype = new superconstructor();
    } finally {
      delete superconstructor._initializeDisabled_;
    }

    if (superconstructor.prototype.constructorProperties) {
      subconstructor.prototype.constructorProperties = _.clone(superconstructor.prototype.constructorProperties);
    }
    subconstructor.prototype.constructor = subconstructor;
    this.addMethods(subconstructor.prototype, originalSubconstructorPrototype);
    return subconstructor;
  },

  addMethods: function(target, source) {
    if (!target) throw new Error("Target module or constructor is null");
    if (!source) throw new Error("Source module is null");
    definePropertyAccessors(source);

    _.each(source, function(value, key) {
      if (key == "constructor") return;
      if (key == "constructorProperties" && target.constructorProperties) {
        _.addMethods(target.constructorProperties, source.constructorProperties);
        return;
      }

      if (target[key] && _.isFunction(target[key]) && _.isFunction(value) && _.argumentNames(value)[0] == "$super") {
        value = _.wrapMethod(target[key], value);
      }
      target[key] = value;
    });
    
    return target;
  },

  assignProperties: function(target, source) {
    _.each(source, function(value, key) {
      if (target[key] && _.isFunction(target[key]) && target[key]._accessor_) {
        target[key](value);
        delete source[key];
      }
    });
    _.addMethods(target, source);
    return target;
  },

  argumentNames: function(fn) {
    var names = fn.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  wrapMethod: function(original, wrapper) {
    return function() {
      return wrapper.apply(this, [_.bind(original, this)].concat(_.toArray(arguments)));
    };
  }
});

var permittedPropertyAccessorDefinitionKeys = ["reader", "writer", "write", "change"];

function definePropertyAccessors(module) {
  if (module.propertyAccessors) {
    var propertyAccessors = module.propertyAccessors;
    delete module.propertyAccessors;
    _.each(propertyAccessors, function(attrName) {
      if (module[attrName] === undefined) module[attrName] = buildPropertyAccessor(attrName)
    }, this);
  }
  _.each(module, function(value, key) {
    if (isPropertyAccessorDefinition(value)) {
      module[key] = buildPropertyAccessor(key, value.reader, value.writer, value.write, value.change);
    }
  });
}

function isPropertyAccessorDefinition(value) {
  if (typeof value !== "object") return false;
  if (_.isEmpty(value)) return false;
  return _.all(_.keys(value), function(key) {
    return _.include(permittedPropertyAccessorDefinitionKeys, key)
  });
}

function buildPropertyAccessor(name, reader, writer, writeHook, changeHook) {
  var fieldName = "_" + name;
  if (!reader) reader = function() { return this[fieldName]; };
  if (!writer) writer = function(value) { this[fieldName] = value; };

  var writeNode, changeNode;

  var accessor = function() {
    if (arguments.length == 0) {
      return reader.call(this);
    } else {
      var oldValue = this[fieldName];
      var newValue = writer.apply(this, arguments) || this[fieldName];

      var writeHookReturnVal, changeHookReturnVal;
      if (writeHook) writeHookReturnVal = writeHook.call(this, newValue, oldValue);
      if (writeNode) writeNode.publish(newValue, oldValue);

      if (newValue !== oldValue) {
        if (changeHook) changeHookReturnVal = changeHook.call(this, newValue, oldValue);
        if (changeNode) changeNode.publish(newValue, oldValue);
      }

      return changeHookReturnVal || writeHookReturnVal || newValue;
    }
  };
  
  accessor.write = function(callback, context) {
    if (!writeNode) writeNode = new Monarch.SubscriptionNode();
    writeNode.subscribe(callback, context);
  };

  accessor.change = function(callback, context) {
    if (!changeNode) changeNode = new Monarch.SubscriptionNode();
    changeNode.subscribe(callback, context);
  };

  accessor._accessor_ = true;
  return accessor;
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
    mixins: []
  };

  _.each(args, function(currentArg) {
    if (_.isString(currentArg)) {
      constructorArguments.qualifiedConstructorName = currentArg;
    } else if (_.isFunction(currentArg)) {
      constructorArguments.superconstructor = currentArg;
    } else {
      constructorArguments.mixins.push(currentArg);
    }
  });

  return constructorArguments;
}

_.module("_.Kernel", {
  hitch: function() {
    var args = _.toArray(arguments);
    var methodName = _.first(args);
    var otherArgs = _.rest(args);
    return _.bind.apply(_, [this[methodName], this].concat(otherArgs));
  },

  bind: function() {
    var args = _.toArray(arguments);
    var fn = _.first(args);
    var otherArgs = _.rest(args);
    return _.bind.apply(_, [fn, this].concat(otherArgs));
  },

  defer: function(fn) {
    return _.defer(this.bind(fn));
  },

  delay: function(fn, time) {
    return _.delay(this.bind(fn), time);
  },

  isA: function(constructor) {
    var currentConstructor = this.constructor;
    while (true) {
      if (currentConstructor === constructor) return true;
      if (currentConstructor.superconstructor) {
        currentConstructor = currentConstructor.superconstructor;
      } else {
        return false;
      }
    }
  }
});

_.constructor("_.Object", {
  constructorProperties: _.extend({
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
  }, _.Kernel)
}, _.Kernel);

})(_);

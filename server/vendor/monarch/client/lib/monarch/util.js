(function(Monarch, jQuery) {

Monarch.module("Monarch.Util", {
  toArray: function(argumentsObject) {
    return Array.prototype.slice.call(argumentsObject, 0);
  },

  remove: function(array, element) {
    var recordIndex = array.indexOf(element);
    if (recordIndex == -1) return null;
    array.splice(recordIndex, 1);
    return element;
  },

  isEmpty: function(arrayOrHash) {
    if (arrayOrHash.length) {
      return arrayOrHash.length == 0;
    } else {
      return this.keys(arrayOrHash).length == 0;
    }
  },

  keys: function(hash, optionalEachFunction) {
    var keys = [];
    for (key in hash) keys.push(key);
    if (optionalEachFunction) {
      _.each(keys, optionalEachFunction);
    }
    return keys;
  },

  values: function(hash, optionalEachFunction) {
    var values = [];
    for (key in hash) values.push(hash[key]);
    if (optionalEachFunction) {
      _.each(values, optionalEachFunction);
    }
    return values;
  },

  all: function(arrayOrHash, fn) {
    if (arrayOrHash.length) {
      return this.arrayAll(arrayOrHash, fn);
    } else {
      return this.hashAll(arrayOrHash, fn);
    }
  },

  any: function(arrayOrHash, fn) {
    if (arrayOrHash.length) {
      return this.arrayAny(arrayOrHash, fn);
    } else {
      return this.hashAny(arrayOrHash, fn);
    }
  },

  select: function(array, fn) {
    var selected = [];
    _.each(array, function(elt) {
      if (fn(elt)) selected.push(elt);
    });
    return selected;
  },

  extend: function() {
    return jQuery.extend.apply(jQuery, arguments);
  },

  trim: function(string) {
    return jQuery.trim(string);
  },

  // private

  arrayDetect: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (fn.call(array[i], array[i])) return array[i];
    }
    return null;
  },

  hashDetect: function(hash, fn) {
    for (key in hash) {
      if (fn.call(hash[key], key, hash[key])) return hash[key];
    }
    return null;
  },
  
  arrayAll: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (!fn(array[i])) return false;
    }
    return true;
  },

  hashAll: function(hash, fn) {
    for(var key in hash) {
      if (!fn(key, hash[key])) return false;
    }
    return true;
  },

  arrayAny: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (fn(array[i])) return true;
    }
    return false;
  },

  hashAny: function(hash, fn) {
    for(var key in hash) {
      if (fn(key, hash[key])) return true;
    }
    return false;
  }
});

})(Monarch, jQuery);

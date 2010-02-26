(function(Monarch, jQuery) {

Monarch.module("Monarch.Util", {
  each: function(array_or_hash, fn) {
    if (array_or_hash.length) {
      this.array_each(array_or_hash, fn);
    } else {
      this.hash_each(array_or_hash, fn);
    }
  },

  detect: function(array_or_hash, fn) {
    if (array_or_hash.length) {
      return this.array_detect(array_or_hash, fn);
    } else {
      return this.hash_detect(array_or_hash, fn);
    }
  },

  index_of: function(array, element) {
    for(var i = 0; i < array.length; i++) {
      if (array[i] == element) return i;
    }
    return -1;
  },

  contains: function(array, element) {
    return this.index_of(array, element) != -1;
  },

  map: function(array, fn) {
    var new_array = [];
    this.each(array, function(element, index) {
      new_array.push(fn.call(element, element, index));
    });
    return new_array;
  },

  to_array: function(arguments_object) {
    return Array.prototype.slice.call(arguments_object, 0);
  },

  remove: function(array, element) {
    var record_index = array.indexOf(element);
    if (record_index == -1) return null;
    array.splice(record_index, 1);
    return element;
  },

  is_empty: function(array_or_hash) {
    if (array_or_hash.length) {
      return array_or_hash.length == 0;
    } else {
      return this.keys(array_or_hash).length == 0;
    }
  },

  keys: function(hash, optional_each_function) {
    var keys = [];
    for (key in hash) keys.push(key);
    if (optional_each_function) {
      Monarch.Util.each(keys, optional_each_function);
    }
    return keys;
  },

  values: function(hash, optional_each_function) {
    var values = [];
    for (key in hash) values.push(hash[key]);
    if (optional_each_function) {
      Monarch.Util.each(values, optional_each_function);
    }
    return values;
  },

  all: function(array_or_hash, fn) {
    if (array_or_hash.length) {
      return this.array_all(array_or_hash, fn);
    } else {
      return this.hash_all(array_or_hash, fn);
    }
  },

  any: function(array_or_hash, fn) {
    if (array_or_hash.length) {
      return this.array_any(array_or_hash, fn);
    } else {
      return this.hash_any(array_or_hash, fn);
    }
  },

  select: function(array, fn) {
    var selected = [];
    this.each(array, function(elt) {
      if (fn(elt)) selected.push(elt);
    });
    return selected;
  },

  extend: function() {
    return jQuery.extend.apply(jQuery, arguments);
  },

  inject: function(array, init, fn) {
    var current_val = init;
    this.each(array, function(elt) {
      current_val = fn(current_val, elt);
    });
    return current_val;
  },

  trim: function(string) {
    return jQuery.trim(string);
  },

  // private

  array_each: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.call(array[i], array[i], i);
    }
  },

  hash_each: function(hash, fn) {
    for (key in hash) {
      fn.call(hash[key], key, hash[key]);
    }
  },

  array_detect: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (fn.call(array[i], array[i])) return array[i];
    }
    return null;
  },

  hash_detect: function(hash, fn) {
    for (key in hash) {
      if (fn.call(hash[key], key, hash[key])) return hash[key];
    }
    return null;
  },
  
  array_all: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (!fn(array[i])) return false;
    }
    return true;
  },

  hash_all: function(hash, fn) {
    for(var key in hash) {
      if (!fn(key, hash[key])) return false;
    }
    return true;
  },

  array_any: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      if (fn(array[i])) return true;
    }
    return false;
  },

  hash_any: function(hash, fn) {
    for(var key in hash) {
      if (fn(key, hash[key])) return true;
    }
    return false;
  }
});

})(Monarch, jQuery);

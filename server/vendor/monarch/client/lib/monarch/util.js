module("Util", {
  each: function(array_or_hash, fn) {
    if (array_or_hash.length) {
      this.array_each(array_or_hash, fn);
    } else {
      this.hash_each(array_or_hash, fn);
    }
  },

  array_each: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.call(array[i], array[i]);
    }
  },

  hash_each: function(hash, fn) {
    for (key in hash) {
      fn.call(hash[key], key, hash[key]);
    }
  },

  map: function(array, fn) {
    var new_array = [];
    this.each(array, function(element) {
      new_array.push(fn.call(element, element));
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
  }
});

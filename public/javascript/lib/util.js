module("Util", {
  each: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.call(array[i], array[i]);
    }
  },

  to_array: function(arguments_object) {
    return Array.prototype.slice.call(arguments_object, 0);
  }
});
module("Util", {
  each: function(array, fn) {
    for(var i = 0; i < array.length; i++) {
      fn.call(array[i], array[i]);
    }
  },

  to_array: function(arguments_object) {
    return Array.prototype.slice.call(arguments_object, 0);
  },

  remove: function(array, element) {
    var tuple_index = array.indexOf(element);
    if (tuple_index == -1) return null;
    array.splice(tuple_index, 1);
    return element;
  }
});

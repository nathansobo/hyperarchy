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
    var record_index = array.indexOf(element);
    if (record_index == -1) return null;
    array.splice(record_index, 1);
    return element;
  }
});

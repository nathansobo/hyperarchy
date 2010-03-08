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
  }
});

})(Monarch, jQuery);

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

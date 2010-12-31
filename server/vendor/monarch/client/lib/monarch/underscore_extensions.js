_.mixin({
  remove: function(array, element) {
    console.debug("remove called", _.clone(array), element);

    var recordIndex = _.indexOf(array, element);
    if (recordIndex == -1) return null;
    array.splice(recordIndex, 1);
    return element;
  },

  trim: function(string) {
    return jQuery.trim(string);
  },

  isObject: function(o) {
    return (typeof o === "object");
  },

  splitAtFirstSlash: function(s) {
    var index = s.indexOf("/");
    if (index == -1) {
      return [s, null];
    } else {
      return [s.substring(0, index), s.substring(index + 1)];
    }
  },

  comparatorSortedIndex: function(array, obj, comparator) {
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      comparator(obj, array[mid]) == 1 ? low = mid + 1 : high = mid;
    }
    return low;
  },

  repeat: function(callback, context, interval) {
    if (!interval) interval = 31;
    if (context) callback = _.bind(callback, context);
    var intervalId = setInterval(callback, interval);
    return function() {
      clearInterval(intervalId);
    };
  }
});
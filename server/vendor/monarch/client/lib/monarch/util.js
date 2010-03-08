(function(Monarch, jQuery) {

_.mixin({
  remove: function(array, element) {
    var recordIndex = _.indexOf(array, element);
    if (recordIndex == -1) return null;
    array.splice(recordIndex, 1);
    return element;
  }
});

Monarch.module("Monarch.Util", {
  extend: function() {
    return jQuery.extend.apply(jQuery, arguments);
  },

  trim: function(string) {
    return jQuery.trim(string);
  }
});

})(Monarch, jQuery);

(function(jQuery) {

_.mixin({
  remove: function(array, element) {
    var recordIndex = _.indexOf(array, element);
    if (recordIndex == -1) return null;
    array.splice(recordIndex, 1);
    return element;
  },

  trim: function(string) {
    return jQuery.trim(string);
  }
});

})(jQuery);

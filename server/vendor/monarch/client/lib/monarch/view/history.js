(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.History", {
  on_change: function(callback) {
    jQuery.historyInit(callback);
  },

  load: function(path) {
    jQuery.historyLoad(path);
  }
});

})(Monarch, jQuery);

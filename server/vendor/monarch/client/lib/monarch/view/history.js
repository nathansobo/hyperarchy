(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.History", {
  on_change: function(callback) {
    jQuery.historyInit(callback);
  },

  load: function(path) {
    this.path = "";
    jQuery.historyLoad(path);
  },

  path: ""
});

})(Monarch, jQuery);

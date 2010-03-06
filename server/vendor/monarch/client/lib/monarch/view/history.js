(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.History", {
  onChange: function(callback) {
    jQuery.historyInit(callback);
  },

  load: function(path) {
    this.path = "";
    jQuery.historyLoad(path);
  },

  path: ""
});

})(Monarch, jQuery);

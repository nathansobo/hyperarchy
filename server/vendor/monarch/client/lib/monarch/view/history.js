(function(Monarch, jQuery) {

_.constructor("Monarch.View.History", {
  onChange: function(callback, context) {
    jQuery.historyInit(context ? _.bind(callback, context) : callback);
  },

  load: function(path) {
    this.path = "";
    jQuery.historyLoad(path);
  },

  path: ""
});

})(Monarch, jQuery);

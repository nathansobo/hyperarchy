(function(Monarch, jQuery) {

_.constructor("Monarch.View.History", {
  onChange: function(callback, context) {
    if (context) callback = _.bind(callback, context);
    $(window).bind('hashchange', function(e) {
      callback(e.getState('url') || "");
    });

    if (!this.triggeredOnce) {
      this.triggeredOnce = true;
      $(window).trigger("hashchange");
    }
  },

  load: function(path) {
    jQuery.bbq.pushState({url: path}, 2);
  },

  path: ""
});

})(Monarch, jQuery);

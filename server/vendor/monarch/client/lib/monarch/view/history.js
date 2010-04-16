(function(Monarch, jQuery) {

_.constructor("Monarch.View.History", {
  onChange: function(callback, context) {
    if (context) callback = _.bind(callback, context);
    $(window).bind('hashchange', function(e) {
      console.debug(e.getState('url'));
      callback(e.getState('url') || "");
    });

    console.debug("HELLO");
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

(function(Monarch, jQuery) {

_.constructor("Monarch.View.History", {
  hashchange: function(callback) {
    jQuery(window).bind('hashchange', callback);
    callback();
  },

  fragment: function(fragment) {
    if (arguments.length == 1) {
      window.location = "http://" + window.location.hostname + window.location.pathname + "#" + fragment;
      return fragment;
    } else {
      return window.location.hash.replace("#", "");
    }
  }
});

})(Monarch, jQuery);

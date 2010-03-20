(function(Monarch, jQuery) {

jQuery.fn.extend({
  appendView: function(contentFn) {
    this.append(Monarch.View.build(contentFn));
    return this;
  },

  view: function() {
    return this.data('view');
  }
});

})(Monarch, jQuery);

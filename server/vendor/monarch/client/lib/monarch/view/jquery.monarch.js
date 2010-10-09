(function(Monarch, jQuery) {

jQuery.fn.extend({
  appendView: function(contentFn) {
    this.append(Monarch.View.build(contentFn));
    return this;
  },

  view: function() {
    return this.data('view');
  },

  fillVerticalSpace: function(spaceAtBottom) {
    var height = $(window).height() - this.offset().top - spaceAtBottom;
    this.height(height);
  }
});

})(Monarch, jQuery);

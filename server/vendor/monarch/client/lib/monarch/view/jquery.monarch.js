(function(Monarch, jQuery) {

jQuery.fn.extend({
  append_view: function(content_fn) {
    this.append(Monarch.View.build(content_fn));
    return this;
  }
});

})(Monarch, jQuery);

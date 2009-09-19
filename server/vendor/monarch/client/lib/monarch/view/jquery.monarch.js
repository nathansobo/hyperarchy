jQuery.fn.extend({
  append_view: function(content_fn) {
    this.append(View.build(content_fn));
    return this;
  }
});

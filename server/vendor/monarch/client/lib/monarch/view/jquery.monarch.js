(function(Monarch, jQuery) {

jQuery.fn.extend({
  appendView: function(contentFn) {
    this.append(Monarch.View.build(contentFn));
    return this;
  },

  view: function() {
    return this.data('view');
  },

  bindHtml: function(record, fieldName) {
    var subscription = this.data('bindHtmlSubscription');
    if (subscription) subscription.destroy();

    var field = record.field(fieldName);
    this.html(field.value());
    var subscription = field.onUpdate(function(newValue) {
      this.html(newValue);
    }, this);
    this.data('bindHtmlSubscription', subscription);

    this.attr('htmlIsBound', true);
  },

  fillVerticalSpace: function(spaceAtBottom) {
    var height = $(window).height() - this.offset().top - spaceAtBottom;
    this.height(height);
  }
});

})(Monarch, jQuery);

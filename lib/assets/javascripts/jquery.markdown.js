(function(jQuery, Attacklab) {
  var markdownConverter = new Attacklab.showdown.converter();

  jQuery.markdown = function(string) {
    if (!string) return string;
    return markdownConverter.makeHtml(string);
  }

  jQuery.fn.extend({
    markdown: function(string) {
      this.html(jQuery.markdown(string));
    },

    bindMarkdown: function(record, fieldName) {
      var subscription = this.data('bindTextSubscription');
      if (subscription) subscription.destroy();
      var field = record.remote.field(fieldName);
      if (!field) throw new Error("No field named " + fieldName + " found.");
      this.markdown(field.value());

      var subscription = field.onUpdate(function(newValue) {
        this.markdown(newValue);
      }, this);
      this.data('bindTextSubscription', subscription);

      this.attr('textIsBound', true);
    }
  });
})(jQuery, Attacklab);
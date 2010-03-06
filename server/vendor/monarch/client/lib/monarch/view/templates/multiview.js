(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Templates.Multiview", Monarch.View.Template, {
  content: function(subviewTemplatesByName) {
    delete subviewTemplatesByName.parentView;
    var b = this.builder;
    b.div(function() {
      Monarch.Util.each(subviewTemplatesByName, function(name, template) {
        b.subview('subviews', name, template);
      })
    });
  },
  
  viewProperties: {
    initialize: function() {
      jQuery.extend(this, this.subviews);
    },

    hideAllExcept: function() {
      var names = Monarch.Util.toArray(arguments);
      Monarch.Util.each(this.subviews, function(subviewName, subview) {
        if (Monarch.Util.contains(names, subviewName)) {
          subview.show();
        } else {
          subview.hide();
        }
      });
    },

    hideAll: function() {
      Monarch.Util.each(this.subviews, function(subviewName, subview) {
        subview.hide();
      });
    }
  }
});

})(Monarch, jQuery);

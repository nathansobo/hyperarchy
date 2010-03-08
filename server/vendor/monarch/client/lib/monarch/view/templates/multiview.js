(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Templates.Multiview", Monarch.View.Template, {
  content: function(subviewTemplatesByName) {
    delete subviewTemplatesByName.parentView;
    var b = this.builder;
    b.div(function() {
      _.each(subviewTemplatesByName, function(template, name) {
        b.subview('subviews', name, template);
      })
    });
  },
  
  viewProperties: {
    initialize: function() {
      jQuery.extend(this, this.subviews);
    },

    hideAllExcept: function() {
      var names = _.toArray(arguments);
      _.each(this.subviews, function(subview, subviewName) {
        if (_.include(names, subviewName)) {
          subview.show();
        } else {
          subview.hide();
        }
      });
    },

    hideAll: function() {
      _.each(this.subviews, function(subview) {
        subview.hide();
      });
    }
  }
});

})(Monarch, jQuery);

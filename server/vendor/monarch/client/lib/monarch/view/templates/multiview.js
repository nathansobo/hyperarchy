(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Templates.Multiview", Monarch.View.Template, {
  content: function(subview_templates_by_name) {
    delete subview_templates_by_name.parent_view;
    var b = this.builder;
    b.div(function() {
      Monarch.Util.each(subview_templates_by_name, function(name, template) {
        b.subview('subviews', name, template);
      })
    });
  },
  
  view_properties: {
    initialize: function() {
      jQuery.extend(this, this.subviews);
    },

    hide_all_except: function() {
      var names = Monarch.Util.to_array(arguments);
      Monarch.Util.each(this.subviews, function(subview_name, subview) {
        if (Monarch.Util.contains(names, subview_name)) {
          subview.show();
        } else {
          subview.hide();
        }
      });
    },

    hide_all: function() {
      Monarch.Util.each(this.subviews, function(subview_name, subview) {
        subview.hide();
      });
    }
  }
});

})(Monarch, jQuery);

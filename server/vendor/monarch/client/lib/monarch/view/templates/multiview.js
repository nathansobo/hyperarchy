constructor("View.Templates.Multiview", View.Template, {
  content: function(subview_templates_by_name) {
    var b = this.builder;
    b.div(function() {
      Util.each(subview_templates_by_name, function(name, template) {
        b.subview('subviews', name, template);
      })
    });
  },
  
  view_properties: {
    initialize: function() {
      jQuery.extend(this, this.subviews);
    },

    hide_all_except: function(name) {
      Util.each(this.subviews, function(subview_name, subview) {
        if (subview_name == name) {
          subview.show();
        } else {
          subview.hide();
        }
      });
    }
  }
});

_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "application", 'class': "container12"}, function() {
      template.header();
    }).ref('body');
  }},

  header: function() { with(this.builder) {
    div({id: "header", 'class': "grid12"}, function() {
      div({'class': "grid2 alpha"}, function() {
        h3({id: "title"}, "hyperarchy");
      });
      div({'class': "grid2 prefix8 omega", style: "display: none"}, function() {
        span("organization:");
        select()
          .ref("organizationSelect")
          .change(function(view) {
            view.organizationSelectChanged();
          });
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      _.each(this.views, function(view) {
        view.hide();
        this.body.append(view);
      }, this);
    },

    switchViews: function(selectedView) {
      _.each(this.views, function(view) {
        if (view === selectedView) {
          view.show();
        } else {
          view.hide();
        }
      });
    }
  }
});

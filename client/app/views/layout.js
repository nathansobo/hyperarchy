_.constructor("Views.Layout", View.Template, {
  content: function() { with(this.builder) {
    div({id: "application", 'class': "container12"}, function() {
      div({id: "header", 'class': "grid12"}, function() {
        div({'class': "grid3 alpha"}, function() {
          div({id: "logo"});
        });


        div({'class': "grid1 prefix8 omega"}, function() {
          a({class: "logout", href: "#"}, "Log Out").click(function() {
            $("<form action='/logout' method='post'>").submit();
          });
        });
      });
    }).ref('body');
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

constructor("Views.Candidates", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget item_list"}, function() {
      div({'class': "widget_content"}, function() {
        ol().ref("ranking_ol");
      });
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      $(window).resize(function() {
        self.fill_height();
      });

      _.defer(function() {
        self.fill_height();
      });
    },

    fill_height: function() {
      var height = $(window).height() - this.widget_content.offset().top - 10;
      this.widget_content.height(height);
    }
  }
});

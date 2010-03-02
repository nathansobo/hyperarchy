constructor("Views.Ranking", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget item_list"}, function() {
      div({'class': "widget_content"}, function() {
        ol().ref("ranking_ol");
      }).ref('widget_content');
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      this.register_resize_callbacks();

      _.defer(function() {
        self.ranking_ol.sortable({
          connectWith: "#candidates ol",
          update: function(event, ui) {
            console.debug(ui);
          }
        });
      });
    },

    register_resize_callbacks: function() {
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
      this.ranking_ol.height(height);
    }
  }
});

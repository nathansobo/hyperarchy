constructor("Views.Ranking", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget itemList"}, function() {
      div({'class': "widgetContent"}, function() {
        ol().ref("rankingOl");
      }).ref('widgetContent');
    });
  }},

  viewProperties: {
    initialize: function() {
      var self = this;
      this.registerResizeCallbacks();

      _.defer(function() {
        self.rankingOl.sortable({
          connectWith: "#candidates ol",

          receive: function(event, ui) {
            console.debug("received", ui.item.index());
          },

          remove: function(event, ui) {
            console.debug("removed", ui.item.index());
          },
          
          update: function(event, ui) {
            console.debug("updated", ui.item.index());
          }
        });
      });
    },

    registerResizeCallbacks: function() {
      var self = this;
      $(window).resize(function() {
        self.fillHeight();
      });

      _.defer(function() {
        self.fillHeight();
      });
    },

    fillHeight: function() {
      var height = $(window).height() - this.widgetContent.offset().top - 10;
      this.rankingOl.height(height);
    }
  }
});

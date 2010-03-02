constructor("Views.Candidates", View.Template, {
  content: function() { with(this.builder) {
    div({id: "ranking", 'class': "widget item_list"}, function() {
      div({'class': "widget_content"}, function() {
        ol().ref("ranking_ol");
      });
    });
  }},

  view_properties: {
    
  }
});

_.constructor('Views.Pages.Organization.ElectionLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    li({'class': "election"}, function() {
      div(function() {
        subview('avatar', Views.Components.Avatar, {imageSize: Application.lineHeight * 3});
        div({'class': "body"}).ref('body')
        subview('candidates', Views.Components.SortedList, {
          buildElement: function(candidate, index) {
            return Monarch.View.build(function(b) { with(b) {
              li({'class': "candidate"}, function() {
                div({'class': "position"}, candidate.position()).ref('position');
                div({'class': "body"}, candidate.body()).ref('body');
              });
            }});
          },
          onUpdate: function(li, record) {
            li.position.text(record.position());
          }
        });
        div({'class': "fadeout"});
      }).click(function() {
        History.pushState(null, null, this.election.url());
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.body.bindText(this.election, 'body');
      this.candidates.relation(this.election.candidates().limit(6));
      this.avatar.user(this.election.creator());
    },

    attach: function() {
      var lineHeight = Application.lineHeight
      var quantizedBodyHeight = Math.ceil(this.body.height() / lineHeight) * lineHeight;
      this.body.css('height', quantizedBodyHeight);
    }
  }
});

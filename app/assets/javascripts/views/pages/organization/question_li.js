_.constructor('Views.Pages.Organization.QuestionLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    li({'class': "question"}, function() {
      div(function() {
        subview('avatar', Views.Components.Avatar, {imageSize: Application.lineHeight * 3});
        div({'class': "body"}).ref('body')
        subview('answers', Views.Components.SortedList, {
          buildElement: function(answer, index) {
            return Monarch.View.build(function(b) { with(b) {
              li({'class': "answer"}, function() {
                div({'class': "position"}, answer.position()).ref('position');
                div({'class': "body"}, answer.body()).ref('body');
              });
            }});
          },
          onUpdate: function(li, record) {
            li.position.text(record.position());
          }
        });
        div({'class': "fadeout"});
      }).click(function() {
        History.pushState(null, null, this.question.url());
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.body.bindText(this.question, 'body');
      this.answers.relation(this.question.answers().limit(6));
      this.avatar.user(this.question.creator());
    },

    attach: function() {
      var lineHeight = Application.lineHeight
      var quantizedBodyHeight = Math.ceil(this.body.height() / lineHeight) * lineHeight;
      this.body.css('height', quantizedBodyHeight);
    }
  }
});

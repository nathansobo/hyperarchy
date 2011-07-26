_.constructor('Views.Lightboxes.FullScreenConsensus', Views.Lightboxes.Lightbox, {
  id: "full-screen-consensus",

  lightboxContent: function() { with(this.builder) {
    h1("Current Consensus");
    subview('list', Views.Components.SortedList, {
      buildElement: function(answer) {
        return Views.Pages.Question.AnswerLi.toView({answer: answer, fullScreen: true});
      },

      onUpdate: function(element, record) {
        element.position.text(record.position());
        element.body.markdown(record.body());
      }
    });
  }},

  viewProperties: {

    question: {
      change: function(question) {
        this.list.relation(question.answers());
      }
    },

    beforeShow: function($super) {
      Application.darkenedBackground.addClass('darker');
      $super();
    },

    afterHide: function($super) {
      $super();
      Application.darkenedBackground.removeClass('darker');
    },

    close: function($super) {
      $super();
      History.replaceState(null, null, this.question().url());
    }
  }
});

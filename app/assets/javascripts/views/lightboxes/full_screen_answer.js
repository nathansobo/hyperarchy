_.constructor('Views.Lightboxes.FullScreenAnswer', Views.Lightboxes.Lightbox, {
  id: "full-screen-answer",

  lightboxContent: function() { with(this.builder) {
    a({'class': "back link"}, "← Back to Consensus").click(function() {
      History.pushState(null, null, this.answer().question().fullScreenUrl());
    });
    subview('answerDetails', Views.Pages.Question.AnswerDetails, {fullScreen: true});
  }},

  viewProperties: {
    answer: {
      change: function(answer) {
        this.answerDetails.answer(answer);
        this.answerDetails.comments.comments(answer.comments());
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
      History.replaceState(null, null, this.answer().url());
    }
  }
});

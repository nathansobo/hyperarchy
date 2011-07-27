_.constructor('Views.Lightboxes.FullScreenAnswer', Views.Lightboxes.Lightbox, {
  id: "full-screen-answer",

  lightboxContent: function() { with(this.builder) {
    a({'class': "nav link"}, "↖ Back to List").ref('backLink').click(function() {
      History.pushState(null, null, this.answer().question().fullScreenUrl());
    });
    a({'class': "next nav link"}, "Next →").ref('nextLink').click('goToNext');
    a({'class': "prev nav link"}, "← Previous").ref('prevLink').click('goToPrevious');
    subview('answerDetails', Views.Pages.Question.AnswerDetails, {fullScreen: true});
  }},

  viewProperties: {
    answer: {
      change: function(answer) {
        this.answerDetails.answer(answer);
        this.answerDetails.comments.comments(answer.comments());

        console.log(answer.previous());
        if (answer.previous()) {
          this.prevLink.show();
        } else {
          this.prevLink.hide();
        }

        if (answer.next()) {
          this.nextLink.css('visibility', 'visible');
        } else {
          this.nextLink.css('visibility', 'hidden');
        }
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
    },

    goToPrevious: function() {
      History.replaceState(null, null, this.answer().previous().fullScreenUrl());
    },

    goToNext: function() {
      History.replaceState(null, null, this.answer().next().fullScreenUrl());
    }
  }
});

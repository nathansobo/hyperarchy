_.constructor('Views.Pages.Question.AnswerLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "answer"}, function() {
      div({'class': "more"}, '…').ref('ellipsis');
      div({'class': "status "}).ref('status');
      div({'class': "position"}, params.answer.position()).ref('position');
      div({'class': "body"}, params.answer.body()).ref('body');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.data('answerId', this.answer.id());

      this.draggable({
        connectToSortable: '#ranked-answers ol',
        appendTo: '#question',
        revert: 'invalid',
        delay: this.dragDelay,
        revertDuration: 100,
        helper: this.hitch('createFixedWidthClone'),
        zIndex: 2,
        start: this.hitch('handleDragStart'),
        cancel: '.expandArrow, .tooltipIcon, .noDrag'
      });

      this.click(this.bind(function() {
        History.pushState(null, null, this.answer.url());
      }));

      this.showOrHideEllipsis();
    },

    dragDelay: 100,

    createFixedWidthClone: function() {
      return this.clone().width(this.width());
    },

    handleDragStart: function() {
      History.pushState(null, null, this.answer.question().url());
    },

    ranking: {
      write: function(ranking) {
        this.status.removeClass("positive negative");
        if (ranking) this.status.addClass(ranking.position() > 0 ? 'positive' : 'negative');
      }
    },

    showOrHideEllipsis: function() {
      if (this.answer.details() || this.answer.commentCount() > 0) {
        this.ellipsis.show();
      } else {
        this.ellipsis.hide();
      }
    }
  }
});

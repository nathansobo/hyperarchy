_.constructor('Views.Pages.Question.CandidateLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "candidate"}, function() {
      div({'class': "more"}, '…').ref('ellipsis');
      div({'class': "status "}).ref('status');
      div({'class': "position"}, params.candidate.position()).ref('position');
      div({'class': "body"}, params.candidate.body()).ref('body');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.data('candidateId', this.candidate.id());

      this.draggable({
        connectToSortable: '#ranked-candidates ol',
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
        History.pushState(null, null, this.candidate.url());
      }));

      this.showOrHideEllipsis();
    },

    dragDelay: 100,

    createFixedWidthClone: function() {
      return this.clone().width(this.width());
    },

    handleDragStart: function() {
      History.pushState(null, null, this.candidate.question().url());
    },

    ranking: {
      write: function(ranking) {
        this.status.removeClass("positive negative");
        if (ranking) this.status.addClass(ranking.position() > 0 ? 'positive' : 'negative');
      }
    },

    showOrHideEllipsis: function() {
      if (this.candidate.details() || this.candidate.commentCount() > 0) {
        this.ellipsis.show();
      } else {
        this.ellipsis.hide();
      }
    }
  }
});

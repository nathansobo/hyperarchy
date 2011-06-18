_.constructor('Views.Pages.Election.CandidateLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "candidate"}, params.candidate.body()).click(function() {
      History.pushState(null, null, params.candidate.url());
    });
  }},

  viewProperties: {
    initialize: function() {
      this.data('candidateId', this.candidate.id());

      this.draggable({
        connectToSortable: '#ranked-candidates ol',
        appendTo: '#election',
        revert: 'invalid',
        delay: 100,
        revertDuration: 100,
        helper: this.hitch('createFixedWidthClone'),
        zIndex: 2,
        cancel: '.expandArrow, .tooltipIcon, .noDrag'
      });
    },

    createFixedWidthClone: function() {
      return this.clone().width(this.width());
    }
  }
});

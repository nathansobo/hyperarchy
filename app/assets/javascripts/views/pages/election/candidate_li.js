_.constructor('Views.Pages.Election.CandidateLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li(params.candidate.body()).click(function() {
      History.pushState(null, null, params.candidate.url());
    });
  }},

  viewProperties: {
    initialize: function() {
      this.data('candidateId', this.candidate.id());

      this.draggable({
        connectToSortable: '#ranked-candidates ol',
        revert: 'invalid',
        revertDuration: 100,
        helper: 'clone',
        zIndex: 99,
        cancel: '.expandArrow, .tooltipIcon, .noDrag'
      });
    }
  }
});

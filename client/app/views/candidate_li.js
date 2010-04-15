_.constructor("Views.CandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({ candidateId: candidate.id() }, function() {
      div({'class': "candidateIcon unrankCandidate", style: "display: none;"})
        .ref('destroyRankingButton')
        .click('destroyRanking');
      div({'class': "candidateIcon candidateRanked", style: "display: none;"})
        .ref('candidateRankedIcon');
      span(candidate.body());
    });
  }},

  viewProperties: {
    initialize: function() {
      this.draggable({
        connectToSortable: "ol#rankedCandidates",
        revert: 'invalid',
        revertDuration: 100,
        helper: 'clone',
        zIndex: 100
      });
    }
  }
});
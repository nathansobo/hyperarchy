_.constructor("Views.UnrankedCandidateLi", Views.CandidateLi, {
  candidateIcon: function() { with(this.builder) {
    div({'class': "candidateIcon candidateRanked", style: "display: none;"})
      .ref('candidateRankedIcon');
  }},

  additionalClass: "unranked",

  viewProperties: {
    initialize: function() {
      var rankingRelation = this.candidate.rankingByCurrentUser();

      if (!rankingRelation.empty()) {
        this.candidateRankedIcon.show();
      }

      rankingRelation.onRemoteInsert(function() {
        this.candidateRankedIcon.show();
      }, this);

      rankingRelation.onRemoteRemove(function() {
        this.candidateRankedIcon.hide();
      }, this);

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
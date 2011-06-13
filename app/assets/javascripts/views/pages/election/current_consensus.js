_.constructor('Views.Pages.Election.CurrentConsensus', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      h2("Current Consensus");
      subview('list', Views.Components.SortedList, {
        buildElement: function(candidate) {
          return Views.Pages.Election.CandidateLi.toView({candidate: candidate});
        }
      });
    })
  }},

  viewProperties: {
    electionId: {
      change: function(electionId) {
        var candidates = Candidate.where({electionId: electionId});
        this.candidatesPromise = candidates.fetch();
        this.candidatesPromise.success(function() {
          this.list.relation(candidates);
        }, this);
        return this.candidatesPromise;
      }
    },

    selectedCandidateId: {
      change: function(selectedCandidateId) {
        this.candidatesPromise.success(function() {
          this.list.find('li').removeClass('selected');
          this.list.elementsById[selectedCandidateId].addClass('selected');
        }, this);
      }
    }
  }
});

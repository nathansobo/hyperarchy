_.constructor("Views.CandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Current Consensus");

      subview('candidatesList', Views.SortedList, {
        olAttributes: { id: "candidates", 'class': "candidates" },
        buildLi: function(candidate) {
          return Views.UnrankedCandidateLi.toView({candidate: candidate});
        }
      });

      div({'class': "loading fetching", style: "display: none"}).ref('loading');
    });
  }},

  viewProperties: {
    initialize: function() {
      var adjustHeight = this.hitch('adjustHeight');
      _.defer(adjustHeight);
      $(window).resize(adjustHeight);
    },

    election: {
      afterChange: function(election) {
        this.candidatesList.relation(election.candidates());
      }
    },

    empty: function() {
      this.candidatesList.empty();
    },

    adjustHeight: function() {
      this.candidatesList.height($(window).height() - this.candidatesList.offset().top - 20);
      this.loading.position({
        my: 'center center',
        at: 'center center',
        of: this.rankedCandidatesList
      });
    }
  }
});

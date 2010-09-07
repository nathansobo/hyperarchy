_.constructor("Views.CandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div(function() {
      div({'class': "candidatesListHeader"}, "Current Consensus");

      subview('candidatesList', Views.SortedList, {
        olAttributes: { id: "candidates", 'class': "candidates" },
        ignoreUpdate: true,
        buildLi: function(candidate) {
          return Views.UnrankedCandidateLi.toView({candidate: candidate});
        }
      });
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
    }
  }
});

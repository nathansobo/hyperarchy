_.constructor("Views.CandidatesList", View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidatesList", style: "display: none;"}, function() {
      div({'class': "candidatesListHeader"}, "Current Consensus");

      subview('candidatesList', Views.SortedList, {
        rootAttributes: { id: "candidates", 'class': "candidates" },
        buildElement: function(candidate) {
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

    fadeIn: function($super) {
      $super();
      this.adjustHeight();
    },

    afterShow: function() {
      this.adjustHeight();
    },

    adjustHeight: function() {
      this.candidatesList.fillVerticalSpace(20);
      this.loading.position({
        my: 'center center',
        at: 'center center',
        of: this.rankedCandidatesList
      });
    }
  }
});

_.constructor("Views.ElectionLi", View.Template, {
  content: function(params) { with(this.builder) {
    var election = params.election;

    li({'class': "grid6"}, function() {
      div({'class': "election"}, function() {
        div({'class': "body"}, election.body()).ref('body');
        subview('candidatesList', Views.SortedList, {
          olAttributes: {'class': "candidates"},
          buildLi: function(candidate) {
            return View.build(function(b) {
              b.li(candidate.body());
            });
          },
          onRemoteUpdate: function(record, changes, li) {
            if (!changes.body) return;
            li.html(changes.body.newValue);
          }
        });

        div({'class': "fadeOut"});
      }).click('displayElection');
    });
  }},

  viewProperties: {
    displayElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election.id()});
    },

    initialize: function() {
      this.candidatesList.relation(this.election.candidates());
    },

    afterRemove: function() {
      this.candidatesList.remove();
    }
  }
});
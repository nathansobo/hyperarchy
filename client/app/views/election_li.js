_.constructor("Views.ElectionLi", View.Template, {
  content: function(params) { with(this.builder) {
    var election = params.election;

    li({'class': "grid6"}, function() {
      div({'class': "election"}, function() {
        div({'class': "body"}, election.body());

        ol({'class': "candidates"}, function() {
          election.candidates().each(function(candidate) {
            li(candidate.body());
          });
        });

        div({'class': "fadeOut"});
      }).click('displayElection');
    });
  }},

  viewProperties: {
    displayElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election.id()});
    }
  }

});
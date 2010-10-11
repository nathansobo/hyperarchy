_.constructor("Views.ElectionLi", View.Template, {
  content: function(params) { with(this.builder) {
    var election = params.election;

    li({'class': "grid6"}, function() {
      div({'class': "election"}, function() {
        div({'class': "voteCount"}, function() {
          div({'class': "number"}, election.voteCount().toString()).ref('voteCountNumber');
          div("votes").ref('voteCountWord');
        }).ref('voteCountBox');

        div({'class': "body"}, election.body()).ref('body');
        subview('candidatesList', Views.SortedList, {
          olAttributes: {'class': "candidates"},
          buildLi: function(candidate) {
            return View.build(function(b) {
              b.li(candidate.body());
            });
          },
          onRemoteUpdate: function(record, changes, li) {
            if (changes.body) li.html(changes.body.newValue);
          }
        });

        div({'class': "fadeOut"});
      }).click('displayElection');
    });
  }},

  viewProperties: {
    displayElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election.id()}, 2);
    },

    initialize: function() {
      this.candidatesList.relation(this.election.candidates());
      this.updateVoteCount(this.election.voteCount(), true);
    },

    afterRemove: function() {
      this.candidatesList.remove();
    },

    updateVoteCount: function(voteCount, suppressFlash) {
      this.voteCountNumber.html(voteCount.toString());
      if (voteCount === 1) {
        this.voteCountWord.html("vote");
      } else {
        this.voteCountWord.html("votes");
      }

      if (!suppressFlash) this.voteCountBox.effect('highlight', {color:"#ffd5cc"}, 2000);
    }
  }
});
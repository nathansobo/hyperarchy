_.constructor("Views.ElectionLi", View.Template, {
  content: function(params) { with(this.builder) {
    var election = params.election;
    var classes = "election dropShadow";
    if (election.currentUsersVisit()) classes += " voted";
    li({'class': "grid6"}, function() {
      div({'class': classes}, function() {
        div({'class': "voteCount"}, function() {
          div({'class': "number"}, election.voteCount().toString()).ref('voteCountNumber');
          div("votes").ref('voteCountWord');
        }).ref('voteCountBox');

        div({'class': "body"}, election.body()).ref('body');
        subview('candidatesList', Views.SortedList, {
          rootAttributes: {'class': "candidates"},
          buildElement: function(candidate, index) {
            return View.build(function(b) { with(b) {
              li(function() {
                table(function() {
                  tr(function() {
                    td({'class': "number"}, index + 1 + ".");
                    td({'class': "candidateBody"}, candidate.body());
                  });
                });
              });
            }});
          },
          onRemoteUpdate: function(li, record, changes, index) {
            if (changes.body) li.find('.candidateBody').html(changes.body.newValue);
          },
          updateIndex: function(li, index) {
            li.find('.number').html(index + 1 + ".");
          }
        });

        div({'class': "fadeOut"});
      })
        .ref('contentDiv')
        .click('displayElection');
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
    },

    visited: function() {
      this.contentDiv.addClass('voted');
    }
  }
});
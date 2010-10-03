_.constructor("Views.ElectionOverview", View.Template, {
  content: function() { with(this.builder) {
    div({'id': "electionOverview"}, function() {
      div({'class': "grid4"}, function() {
        h1({'class': "clickable"})
          .click('goToOrganization')
          .ref('organizationName');

        div(function() {
          div({'class': "expandArrow", style: "display: none;"})
            .ref('expandArrow')
            .click('expandOrContract');

          div({id: "electionBodyContainer"}, function() {
            textarea({'class': "electionBody", style: "display: none;"})
              .ref('bodyTextarea')
              .bind('keyup paste', 'enableOrDisableSaveButton')
              .keydown(function(view, event) {
                if (event.keyCode === 13) {
                  view.updateElectionBody();
                  event.preventDefault();
                }
              });
            div({'class': "electionBody largeFont"}).ref('bodyDiv');
          });

          div({'class': "clear"});
        });


        div({id: "expandedArea", style: "display: none;"}, function() {
          button("Save")
            .ref('saveButton')
            .click('updateElectionBody');
          button("Delete Question")
            .click('destroyElection');
          div({'class': "loading", style: "display: none;"}).ref('electionSpinner');
          div({'class': "clear"});
        }).ref('expandedArea');

        div({id: "createCandidateForm"}, function() {
          textarea({placeholder: "Type your own suggestion here.", rows: 3})
            .ref('createCandidateTextarea')
            .keypress(function(view, e) {
              if (e.keyCode === 13) {

                if (!view.createCandidateButton.is(":disabled")) {
                  view.createCandidateButton.click();
                }
                return false;
              }
            });


          button("Suggest Answer")
            .click('createCandidate')
            .ref('createCandidateButton');

          div({'class': "loading", style: "display: none"}).ref('createCandidateSpinner');
          div({'class': "clear"});
        }).ref('createCandidateForm');

        div({'class': "voteCount"}, "8 Votes");

      });


      div({'class': "grid4"}, function() {
        subview('candidatesList', Views.CandidatesList);
      });

      div({'class': "grid4"}, function() {
        subview('rankedCandidatesList', Views.RankedCandidatesList);
      });
    });
  }},

  viewProperties: {
    viewName: 'election',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.defer(function() {
        this.createCandidateTextarea.elastic();
        this.bodyTextarea.elastic();
      });
    },

    navigate: function(state) {
      this.rankedCandidatesList.hide();
      var electionId = state.electionId;
      var election = Election.find(electionId);

      if (!election) {
        this.startLoading();
        Server.fetch([
          Election.where({id: electionId}).joinTo(Organization),
          Candidate.where({electionId: electionId})
        ]).onSuccess(function() {
          this.stopLoading();
          this.navigate(state);
        }, this);
        
        return;
      }

      this.candidatesList.adjustHeight();
      this.rankedCandidatesList.adjustHeight();
      this.election(election);
      if (!election.candidates().empty()) this.rankedCandidatesList.show();
    },

    election: {
      afterChange: function(election) {
        this.subscriptions.destroy();

        this.organizationName.html(election.organization().name());
        this.bodyTextarea.val(election.body());
        this.bodyDiv.html(election.body());
        this.contract(true);

        if (election.belongsToCurrentUser() || election.organization().currentUserIsOwner()) {
          this.expandArrow.show();
        } else {
          this.expandArrow.hide();
        }

        this.subscriptions.add(election.remote.field('body').onUpdate(function(newBody) {
          this.bodyTextarea.val(newBody);
          this.bodyDiv.html(newBody);
        }, this));

        this.subscriptions.add(election.onRemoteDestroy(function() {
          this.goToOrganization();
        }, this));

        this.subscriptions.add(election.candidates().onRemoteInsert(function() {
          if (this.rankedCandidatesList.is(":hidden")) this.rankedCandidatesList.fadeIn();
        }, this));

        this.subscriptions.add(election.candidates().onRemoteRemove(function() {
          if (election.candidates().empty()) this.rankedCandidatesList.fadeOut();
        }, this));

        this.candidatesList.empty();
        this.rankedCandidatesList.empty();

        this.candidatesList.election(election);
        this.rankedCandidatesList.startLoading();
        election.rankingsForCurrentUser().fetch()
          .onSuccess(function() {
            this.rankedCandidatesList.stopLoading();
            this.rankedCandidatesList.election(election);
          }, this);

        Server.subscribe([election, election.candidates()])
          .onSuccess(function(subscriptions) {
            this.subscriptions.add(subscriptions);
          }, this);
      }
    },

    createCandidate: function() {
      var body = this.createCandidateTextarea.val();
      if (body === "") return;

      this.createCandidateSpinner.show();
      this.createCandidateTextarea.attr('disabled', true)
      this.createCandidateButton.attr('disabled', true);
      this.election().candidates().create({body: body})
        .onSuccess(function() {
          this.createCandidateSpinner.hide();
          this.createCandidateTextarea.val("");
          this.createCandidateTextarea.attr('disabled', false)
          this.createCandidateButton.attr('disabled', false);
        }, this);
    },

    goToOrganization: function() {
      $.bbq.pushState({view: "organization", organizationId: this.election().organizationId() }, 2);
    },

    expandOrContract: function() {
      if (this.expanded) {
        this.contract();
      } else {
        this.expand();
      }
    },

    expand: function() {
      this.expanded = true;
      this.expandArrow.addClass('expanded');
      this.bodyTextarea.show();
      this.bodyTextarea.keyup();
      this.bodyTextarea.focus();
      this.bodyDiv.hide();
      this.expandedArea.slideDown('fast');
    },

    contract: function(dontAnimate) {
      this.expandArrow.removeClass('expanded');
      this.expanded = false;
      this.bodyTextarea.hide();
      this.bodyDiv.show();

      if (dontAnimate) {
        this.expandedArea.hide();
      } else {
        this.expandedArea.slideUp('fast');
      }
    },

    enableOrDisableSaveButton: function() {
      if (this.bodyTextarea.val() === this.election().body()) {
        this.saveButton.attr('disabled', true);
      } else {
        this.saveButton.attr('disabled', false);
      }
    },

    updateElectionBody: function() {
      this.electionSpinner.show();
      this.election().update({body: this.bodyTextarea.val()})
        .onSuccess(function() {
          this.electionSpinner.hide();
          this.expandOrContract();
        }, this);
    },

    destroyElection: function() {
      this.electionSpinner.show();
      this.election().destroy()
        .onSuccess(function() {
          this.electionSpinner.hide();
        }, this);
    },

    startLoading: function() {

    },

    stopLoading: function() {
      
    }
  }
});

_.constructor("Views.ElectionOverview", View.Template, {
  content: function() { with(this.builder) {
    div({'id': "electionOverview"}, function() {
      div({'class': "grid12"}, function() {
        h1({'class': "clickable", 'style': "margin-bottom: 15px;"})
          .click('goToOrganization')
          .ref('organizationName');
      });

      div({'class': "grid4"}, function() {
        div({style: "margin-bottom: 20px;"}, function() {
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
        });

        div({id: "createCandidateForm", style: "display: none;"}, function() {
          label("Short Answer");
          textarea({id: "shortAnswer"})
            .ref('createCandidateBodyTextarea')
            .keypress(function(view, e) {
              if (e.keyCode === 13) {
                view.createCandidateButton.click();
                return false;
              }
            });

          label("Optional Details")
          textarea({id: "optionalDetails"}).ref('createCandidateDetailsTextarea');
          div({'class': "clear"});
        }).ref('createCandidateForm');

        a({id: "cancelCreateCandidateButton", 'class': "glossyBlack roundedButton", style: "display: none;", href: "#"}, function() {
          div({'class': "cancelX white"});
        }).ref('cancelCreateCandidateButton')
          .click(function(view) {
            view.hideCreateCandidateForm();
            return false;
          });

        a({id: "createCandidateButton", href: "#", 'class': "glossyBlack roundedButton"}, "Suggest An Answer")
          .click('createCandidateButtonClicked')
          .ref('createCandidateButton');

        div({'class': "clear"});

        subview('votesList', Views.VotesList);
      });

      div({'class': "grid4"}, function() {
        subview('candidatesList', Views.CandidatesList);
      });

      div({'class': "grid4"}, function() {
        subview('rankedCandidatesList', Views.RankedCandidatesList);
      });

      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'election',

    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.defer(function() {
        this.find('textarea').elastic();
      });

      this.defer(function() {
        this.fillVerticalSpace();
      });
      $(window).resize(this.bind(function() {
        this.fillVerticalSpace();
      }));
    },

    navigate: function(state) {
      this.rankedCandidatesList.hide();
      this.candidatesList.adjustHeight();
      this.rankedCandidatesList.adjustHeight();

      var election = Election.find(state.electionId);
      if (!election) {
        this.retryNavigateAfterFetchingNeededData(state);
        return;
      }
      this.election(election);
      this.rankingsUserId(state.rankingsUserId || Application.currentUserId);
      if (election.candidates().empty()) {
        this.candidatesList.hide();
        this.rankedCandidatesList.hide();
      } else {
        this.candidatesList.show();
        this.rankedCandidatesList.show();
      }
    },

    retryNavigateAfterFetchingNeededData: function(state) {
      this.startLoading();
      var electionId = state.electionId;
      Server.fetch([
        Election.where({id: electionId}).joinTo(Organization),
        Candidate.where({electionId: electionId})
      ]).onSuccess(function() {
        this.stopLoading();
        this.navigate(state);
      }, this);
    },

    rankingsUserId: {
      afterWrite: function(rankingsUserId) {
        var rankingsUser = User.find(rankingsUserId);
        if (!rankingsUser) {
          this.rankedCandidatesList.startLoading();
          User.fetch(rankingsUserId).onSuccess(this.hitch('rankingsUserId', rankingsUserId));
          return;
        }
        this.rankedCandidatesList.rankingsUser(rankingsUser);
      }
    },

    election: {
      afterChange: function(election) {
        Application.currentOrganizationId(election.organizationId());
        if (election.candidates().empty()) {
          this.showCreateCandidateForm("instantly");
        } else {
          this.hideCreateCandidateForm(_.identity, "instantly");
        }
        this.populateElectionDetails(election);
        this.subscribeToElectionChanges(election);
        this.candidatesList.election(election);
        this.rankedCandidatesList.election(election);
        this.votesList.election(election);
      }
    },

    populateElectionDetails: function(election) {
      this.organizationName.bindHtml(election.organization(), 'name');
      this.bodyTextarea.val(election.body());
      this.bodyDiv.bindHtml(election, 'body');
      if (election.editableByCurrentUser()) {
        this.expandArrow.show();
      } else {
        this.expandArrow.hide();
      }
      this.contract(true);
      this.votesList.adjustHeight();
    },

    subscribeToElectionChanges: function(election) {
      this.subscriptions.destroy();
      this.subscriptions.add(election.remote.field('body').onUpdate(function(newBody) {
        this.bodyTextarea.val(newBody);
      }, this));

      this.subscriptions.add(election.onRemoteDestroy(function() {
        this.goToOrganization();
      }, this));

      this.subscriptions.add(election.candidates().onRemoteInsert(function() {
        if (this.candidatesList.is(":hidden")) {
          this.candidatesList.fadeIn();
          this.rankedCandidatesList.fadeIn();
        }
      }, this));

      this.subscriptions.add(election.candidates().onRemoteRemove(function() {
        if (election.candidates().empty()) {
          this.candidatesList.fadeOut();
          this.rankedCandidatesList.fadeOut();
        }
      }, this));
    },

    createCandidateButtonClicked: function() {
      if (this.createCandidateForm.is(":visible")) {
        this.createCandidate();
      } else {
        this.showCreateCandidateForm();
      }
      return false;
    },

    showCreateCandidateForm: function(showInstantly) {
      var cancelResize = _.repeat(function() {
        this.votesList.adjustHeight();
      }, this);

      var afterFormIsShown = this.bind(function() {
        this.createCandidateBodyTextarea.focus();
        this.cancelCreateCandidateButton.show();
        this.createCandidateButton.addClass('open');
        this.createCandidateButton.html("Suggest This Answer");
        cancelResize();
      });

      if (showInstantly) {
        this.createCandidateForm.show();
        afterFormIsShown();
      } else {
        this.createCandidateForm.slideDown('fast', afterFormIsShown);
      }
    },

    hideCreateCandidateForm: function(whenDone, instantly) {
      this.createCandidateBodyTextarea.val("");
      this.createCandidateDetailsTextarea.val("");
      this.createCandidateButton.removeClass('open');
      this.createCandidateButton.html("Suggest An Answer");
      this.cancelCreateCandidateButton.hide();

      if (instantly) {
        this.createCandidateForm.hide();
        this.votesList.adjustHeight();
        if (whenDone) whenDone();
      } else {
        var cancelResize = _.repeat(function() {
          this.votesList.adjustHeight();
        }, this);
        this.createCandidateForm.slideUp('fast', function() {
          cancelResize();
          if (whenDone) whenDone();
        });
      }

      return false;
    },

    createCandidate: function() {
      if (this.candidateCreationDisabled) return false;

      var body = this.createCandidateBodyTextarea.val();
      var details = this.createCandidateDetailsTextarea.val();
      if (body === "") return;

      this.createCandidateBodyTextarea.attr('disabled', true);
      this.createCandidateDetailsTextarea.attr('disabled', true);
      this.candidateCreationDisabled = true;

      this.election().candidates().create({body: body, details: details})
        .onSuccess(function() {
          var enableForm = this.bind(function() {
            this.createCandidateBodyTextarea.attr('disabled', false);
            this.createCandidateDetailsTextarea.attr('disabled', false);
            this.candidateCreationDisabled = false;
          });

          if (this.election().candidates().size() === 1) {
            this.delay(function() {
              this.hideCreateCandidateForm(enableForm);
            }, 200)
          } else {
            this.hideCreateCandidateForm(enableForm);
          }
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

      this.votesList.adjustHeight();
      this.expandedArea.slideDown('fast', _.repeat(function() {
        this.votesList.adjustHeight();
      }, this));
    },

    contract: function(dontAnimate) {
      this.expandArrow.removeClass('expanded');
      this.expanded = false;
      this.bodyTextarea.hide();
      this.bodyDiv.show();

      if (dontAnimate) {
        this.expandedArea.hide();
      } else {
        this.expandedArea.slideUp('fast', _.repeat(function() {
          this.votesList.adjustHeight();
        }, this));
      }

      this.votesList.adjustHeight();
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

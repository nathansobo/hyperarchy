_.constructor("Views.ElectionOverview", View.Template, {
  content: function() { with(this.builder) {
    div({'id': "electionOverview"}, function() {
      div({id: "electionOverviewHeader"}, function() {
        div({'class': "grid8"}, function() {
          h1({'class': "clickable", style: "display: none"})
            .click('goToOrganization')
            .ref('organizationName');

          div({id: "electionBodyContainer"}, function() {
            div({'class': "expandArrow", style: "display: none;"})
              .ref('expandLink')
              .click('expandOrContract');

            div({id: "electionBodyContainerRight"}, function() {
              h2({'class': "electionBody"}).ref('bodyElement');

              textarea({'class': "electionBody", style: "display: none;"})
                .ref('bodyTextarea')
                .bind('keyup paste', 'enableOrDisableSaveButton')
                .keydown(function(view, event) {
                  if (event.keyCode === 13) {
                    view.updateElectionBody();
                    event.preventDefault();
                  }
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
          });
        });

        div({'class': 'grid4'}, function() {
          a({id: "showCreateCandidateFormButton", 'class': "glossyLightGray roundedButton"}, "Suggest An Answer")
            .click('showOrHideCreateCandidateForm')
            .ref('showCreateCandidateFormButton');
        });

        div({'class': "clear"});
      });

      div({'class': "grid4"}, function() {
        subview('candidatesList', Views.CandidatesList);
      });

      div({'class': "grid4"}, function() {
        subview('rankedCandidatesList', Views.RankedCandidatesList);
      });

      div({'class': "grid4"}, function() {
        div({id: "createCandidateForm", style: "display: none;"}, function() {
          div({'class': "columnHeader"}, function() {
            div({'class': "small cancelX"})
              .ref('hideCreateCandidateFormCancelX')
              .click(function(view) {
                view.hideCreateCandidateForm();
              });
            text("Enter Your Answer");
          });
          
          textarea({id: "shortAnswer"})
            .ref('createCandidateBodyTextarea')
            .keypress(function(view, e) {
              if (e.keyCode === 13) {
                view.createCandidateButton.click();
                return false;
              }
            });
          textarea({id: "optionalDetails", placeholder: "Further Details (Optional)"}).ref('createCandidateDetailsTextarea');
          div({'class': "clear"});

          a({id: "createCandidateButton", 'class': "glossyLightGray roundedButton", href: "#"}, "Suggest This Answer")
            .ref('createCandidateButton')
            .click('createCandidate');

          div({'class': "loading", style: "display: none;"}).ref("createCandidateSpinner");
          div({'class': "clear"});
        }).ref('createCandidateForm');

        div({id: 'createdBy', style: "display: none;"}, function() {
          div({'class': "columnHeader"}, function() {
            text("Question Raised By");
          });
          div({'class': "relatedUser"}, function() {
            subview('creatorAvatar', Views.Avatar, { size: 40 });
            div({'class': "details"}, function() {
              div({'class': "name"}, "").ref('creatorName');
              div({'class': "date"}, "").ref('createdAt');
            });
            div({'class': "clear"});
          });
        }).ref('creatorDiv');

        subview('votesList', Views.VotesList);
      });

      div({'class': "clear"});

      div(function() {
        div({id: "leftContent"}, function() {
          a("Back to Questions")
            .click(function() {
              Application.layout.goToOrganization();
            });
        });
        div({id: "rightContent"}, function() {
          a("< Previous")
            .ref("previousElectionLink")
            .click("goToNextElection");
          span("9").ref("electionPosition");
          span("of");
          span("89").ref("numElections");
          a("Next >")
            .ref("nextElectionLink")
            .click("goToPreviousElection");
        });
      }).ref("subNavigationContent");
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
        this.adjustHeight();
      });
      $(window).resize(this.bind(function() {
        this.adjustHeight();
      }));
    },

    navigate: function(state) {
      this.adjustHeight();
      this.electionId(parseInt(state.electionId));
      this.rankingsUserId(state.rankingsUserId || Application.currentUserId);
      Server.post("/visited?election_id=" + state.electionId);

      Application.layout.activateNavigationTab("questionsLink");
      Application.layout.showSubNavigationContent("elections");
    },

    electionId: {
      afterChange: function(electionId, previousElectionId) {
        this.hideElementsWhileLoading();

        var additionalRelations = [
          Election.where({id: electionId}).joinTo(Organization),
          Candidate.where({electionId: electionId})
        ];
        this.startLoading();
        Election.findOrFetch(electionId, additionalRelations)
          .onSuccess(function(election) {
            if (election) {
              this.election(election);
            } else {
              var lastVisitedOrgId = Application.currentUser().lastVisitedOrganization().id();
              $.bbq.pushState({view: 'organization', organizationId: lastVisitedOrgId}, 2);
            }
            this.stopLoading();
            this.showElementsAfterLoading();
          }, this);
      }
    },

    rankingsUserId: {
      afterChange: function(rankingsUserId) {
        var rankingsUser = User.find(rankingsUserId);
        if (!rankingsUser) {
          this.rankedCandidatesList.startLoading();
          User.fetch(rankingsUserId).onSuccess(function() {
            this.rankedCandidatesList.rankingsUser(User.find(rankingsUserId));
          }, this);
        } else {
          this.rankedCandidatesList.rankingsUser(rankingsUser);
        }
      }
    },

    election: {
      afterChange: function(election) {
        Application.currentOrganizationId(election.organizationId());

        this.populateElectionDetails(election);
        this.populateCreator(election);
        this.subscribeToElectionChanges(election);
        this.candidatesList.election(election);
        this.rankedCandidatesList.election(election);
        this.votesList.election(election);

        this.populateSubNavigationBar();
      }
    },

    populateSubNavigationBar: function() {
      this.electionPosition.bindHtml(this.election(), "id");
      this.numElections.html(this.election().organization().elections().size());

      // set 'numElections' to the actual number of elections in the organization
      // if at first election, don't show 'previous' link
      // if at last election, don't show 'next' link
    },

    hideElementsWhileLoading: function() {
      this.showCreateCandidateFormButton.hide();
      this.hideCreateCandidateForm(true);
      this.candidatesList.hide();
      this.rankedCandidatesList.hide();
      this.creatorDiv.hide();
    },

    showElementsAfterLoading: function() {
      if (!this.election()) return;
      if (this.election().candidates().empty()) {
        this.hideCreateCandidateFormCancelX.hide();
        this.showCreateCandidateForm("instantly");
      } else {
        this.candidatesList.show();
        this.rankedCandidatesList.show();
        this.hideCreateCandidateFormCancelX.show();
        this.showCreateCandidateFormButton.show();
        this.hideCreateCandidateForm(true);
      }
    },

    populateElectionDetails: function(election) {
      this.organizationName.bindHtml(election.organization(), 'name');
      this.bodyTextarea.val(election.body());
      this.bodyElement.bindHtml(election, 'body');
      if (election.editableByCurrentUser()) {
        this.expandLink.show();
      } else {
        this.expandLink.hide();
      }
      this.contract(true);
      this.adjustHeight();
    },

    populateCreator: function(election) {
      User.findOrFetch(election.creatorId()).onSuccess(function(creator) {
        this.creatorName.html(creator.fullName());
        this.createdAt.html(election.formattedCreatedAt());
        this.creatorAvatar.user(creator);
        this.creatorDiv.show();
      }, this);
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
          this.showCreateCandidateFormButton.show();
          this.hideCreateCandidateFormCancelX.show();
          this.hideCreateCandidateForm(true);
          this.candidatesList.fadeIn();
          this.rankedCandidatesList.fadeIn();
        }
      }, this));

      this.subscriptions.add(election.candidates().onRemoteRemove(function() {
        if (election.candidates().empty()) {
          this.hideCreateCandidateFormCancelX.hide();
          this.candidatesList.fadeOut();
          this.showCreateCandidateFormButton.hide();
          this.rankedCandidatesList.fadeOut(this.bind(function() {
            this.showCreateCandidateForm();
          }));
        }
      }, this));
    },

    showOrHideCreateCandidateForm: function() {
      if (this.createCandidateForm.is(":visible")) {
        this.hideCreateCandidateForm(false, false, "preserveText");
      } else {
        this.showCreateCandidateForm();
      }
      return false;
    },

    showCreateCandidateForm: function(instantly) {
      this.showCreateCandidateFormButton.addClass('pressed');

      var cancelResize = _.repeat(function() {
        this.votesList.adjustHeight();
      }, this);

      var afterFormIsShown = this.bind(function() {
        this.createCandidateBodyTextarea.focus();
        cancelResize();
      });

      if (instantly) {
        this.createCandidateForm.show();
        this.votesList.adjustHeight();
        afterFormIsShown();
      } else {
        this.createCandidateForm.slideDown('fast', afterFormIsShown);
      }
    },

    hideCreateCandidateForm: function(instantly, whenDone, preserveText) {
      this.showCreateCandidateFormButton.removeClass('pressed');

      if (!preserveText) {
        this.createCandidateBodyTextarea.val("");
        this.createCandidateDetailsTextarea.val("");
      }

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

    createCandidate: function(elt, e) {
      this.createCandidateBodyTextarea.blur();
      this.createCandidateDetailsTextarea.blur();
      e.preventDefault();

      if (this.candidateCreationDisabled) return;

      var body = this.createCandidateBodyTextarea.val();
      var details = this.createCandidateDetailsTextarea.val();
      if (body === "") return;

      this.createCandidateBodyTextarea.attr('disabled', true);
      this.createCandidateDetailsTextarea.attr('disabled', true);
      this.candidateCreationDisabled = true;

      this.createCandidateSpinner.show();
      this.election().candidates().create({body: body, details: details})
        .onSuccess(function() {
          this.createCandidateSpinner.hide();
          this.hideCreateCandidateForm(false, this.bind(function() {
            this.createCandidateBodyTextarea.attr('disabled', false);
            this.createCandidateDetailsTextarea.attr('disabled', false);
            this.candidateCreationDisabled = false;
          }));
        }, this);
    },

    goToOrganization: function() {
      $.bbq.pushState({view: "organization", organizationId: this.election().organizationId() }, 2);
    },

    goToNextElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election().id() + 1}, 2);
    },

    goToPreviousElection: function() {
      $.bbq.pushState({view: "election", electionId: this.election().id() - 1}, 2);
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
      this.expandLink.addClass('expanded');
      this.bodyTextarea.show();
      this.bodyTextarea.keyup();
      this.bodyTextarea.focus();
      this.bodyElement.hide();

      $(window).resize();
      this.expandedArea.slideDown('fast', _.repeat(function() {
        $(window).resize();
      }));
    },

    contract: function(dontAnimate) {
      this.expandLink.removeClass('expanded');
      this.expanded = false;
      this.bodyTextarea.hide();
      this.bodyElement.show();

      if (dontAnimate) {
        this.expandedArea.hide();
        $(window).resize();
      } else {
        this.expandedArea.slideUp('fast', _.repeat(function() {
          $(window).resize();
        }));
      }

      this.adjustHeight();
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
      
    },

    adjustHeight: function() {
      this.fillVerticalSpace(30, 300);
      this.candidatesList.adjustHeight();
      this.rankedCandidatesList.adjustHeight();
    }
  }
});

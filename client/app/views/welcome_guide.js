_.constructor("Views.WelcomeGuide", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "grid12"}, function() {
      table({id: "welcomeGuide", 'class': "dropShadow"}, function() {
        thead(function() {
          tr(function() {
            th({id: "step1", 'class': "pending"}, "1. Raise A Question").ref('step1Header');
            th({id: "step2", 'class': "pending"}, "2. Suggest Answers").ref('step2Header');
            th({id: "step3", 'class': "pending"}, "3. Rank Answers").ref('step3Header');
            th({id: "step4", 'class': "pending"}, "4. Invite Team").ref('step4Header');
            th({id: "gloss"});
          });
        });
        tbody(function() {
          tr(function() {
            td({id: "currentStep", colspan: 4}, function() {
              div(function() {
                div({'class': "step"}, function() {
                  h2("Welcome to Hyperarchy!");
                  div({'class': "stepDescription"}, function() {
                    raw("This is a private discussion area for <em>Alpha Testers</em>. Let's get the conversation started by raising a question for your team to discuss. To do that, click on the black <strong>Raise Question</strong> button below.");
                  })
                }).ref("step1A");
                div({'class': "step"}, function() {
                  h2("Tips for Good Questions");
                  div({'class': "stepDescription"}, function() {
                    raw("<strong>Tips:</strong> Try to keep your question open ended. Instead of asking \"Should we get pizza for lunch?\", ask \"What should we get for lunch?\", then add \"Pizza\" as an answer in the next step.");
                  })
                }).ref("step1B");
                div({'class': "step"}, function() {
                  h2("Now Add Answers");
                }).ref("step2A");
                div({'class': "step"}, function() {
                  h2("Click A Question To Add Answers");
                }).ref("step2B");
                div({'class': "step"}, function() {
                  h2("Now Vote");
                }).ref("step3A");
                div({'class': "step"}, function() {
                  h2("Click A Question So You Can Vote");
                }).ref("step3B");
                div({'class': "step"}, function() {
                  h2("Invite Your Team");
                }).ref("step4A");
                div({'class': "step"}, function() {
                  h2("Go To Edit Organization To Invite Your Team");
                }).ref("step4B");
              });
            });
          });
        });
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      Application.welcomeGuide = this;
      this.find(".step").hide();
      this.step1A.show();
      $(window).bind('hashchange', this.hitch('determineStep'));
    },

    organization: {
      afterChange: function(organization) {
        var keyRelations = [
          organization.elections(),
          organization.candidates(),
          organization.votes(),
          organization.memberships()
        ];

        Server.fetch(keyRelations).onSuccess(function() {
          this.determineStep();
          _.each(keyRelations, function(relation) {
            relation.onRemoteInsert(this.hitch('determineStep'));
            relation.onRemoteRemove(this.hitch('determineStep'));
          }, this);
        }, this);
      }
    },

    determineStep: function() {
      if (!this.organization()) return;
      
      if (this.organization().elections().empty()) {
        this.setStep(1, "A");
      } else if (this.organization().candidates().empty()) {
        if ($.bbq.getState().view == "election") {
          this.setStep(2, "A");
        } else {
          this.setStep(2, "B");
        }
      } else if (this.organization().votes().empty()) {
        if ($.bbq.getState().view == "election") {
          this.setStep(3, "A");
        } else {
          this.setStep(3, "B");
        }
      } else if (this.organization().memberships().size() == 1) {
        if ($.bbq.getState().view == "editOrganization") {
          this.setStep(4, "A");
        } else {
          this.setStep(4, "B");
        }
      } else {
        this.finish();
      }
    },

    setStep: function(step, substep) {
      this.step = step;
      this.find('.step').hide();
      this['step' + step + substep].show();

      for (var i = 1; i <= 4; i++) {
        var header = this.stepHeader(i);
        if (i < step) {
          header.removeClass('pending').addClass('done');
        } else if (i == step) {
          header.removeClass('pending done');
        } else {
          header.removeClass('done').addClass('pending');
        }
      }

      $(window).trigger('resize');
    },

    stepHeader: function(step) {
      return this['step' + step + 'Header'];
    },

    finish: function() {
      this.hide();
      $(window).trigger('resize');
    },

    raiseQuestionClicked: function() {
      if (this.step == 1) {
        this.setStep(1, "B");
      }
    }
  }
});

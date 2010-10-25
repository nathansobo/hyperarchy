_.constructor("Views.CandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({ candidateId: candidate.id(), 'class': "candidate " + this.additionalClass }, function() {
      div({'class': "expandArrow"})
        .ref('expandArrow')
        .click('expandOrContract');

      div({'class': "loading candidateIcon", style: "display: none;"}).ref('loadingIcon');

      template.candidateIcon();
      div({'class': "candidateIcon detailsIcon"});

      div({'class': "body"}).ref('body');

      div({'class': "expandedInfoSpacer"}).ref('expandedInfoSpacer')

      div({'class': "expandedInfo", style: "display: none;"}, function() {
        label("Answer");
        div({'class': "bodyContainer"}, function() {
          textarea(candidate.body())
            .keydown(function(view, e) {
              if (e.keyCode === 13) {
                view.saveCandidate();
                e.preventDefault();
              }
            })
            .bind('keyup paste change', "deferredEnableOrDisableSaveButton")
            .ref('bodyTextarea');
          div({'class': "nonEditable"})
            .ref('nonEditableBody');
        });

        label("Details");
        div({'class': "detailsContainer"}, function() {
          textarea({'class': "details"})
            .bind('keyup paste change', "deferredEnableOrDisableSaveButton")
            .ref('detailsTextarea');
          div({'class': "nonEditable"})
            .ref('nonEditableDetails');
        });

        button("Save")
          .ref('saveButton')
          .click("saveCandidate");
        button({style: "float: right"}, "Delete").click("destroyCandidate");
        div({'class': "clear"});
      }).ref('expandedInfo');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle;
      this.assignBody(this.candidate.body());
      this.assignDetails(this.candidate.details());

      this.subscriptions.add(this.candidate.onRemoteUpdate(function(changes) {
        if (changes.body) {
          this.assignBody(changes.body.newValue);
        }
        if (changes.details) {
          this.assignDetails(changes.details.newValue);
        }
      }, this));

      this.defer(function() {
        this.bodyTextarea.elastic();
        this.detailsTextarea.elastic();
      });

      if (this.candidate.editableByCurrentUser()) {
        this.nonEditableBody.hide();
        this.nonEditableDetails.hide();
      } else {
        this.detailsTextarea.hide();
        this.bodyTextarea.hide();
        this.expandedInfo.find('button').hide();
      }
    },

    afterRemove: function() {
      this.subscriptions.destroy();
    },

    expandOrContract: function() {
      if (this.expanded) {
        this.expanded = false;
        this.expandArrow.removeClass('expanded');

        this.delay(function() {
          this.expandedInfoSpacer.slideUp('fast');
          this.body.show();
        }, 90);

        this.expandedInfo.slideUp('fast', this.bind(function() {
          this.removeClass("expanded")
        }));
      } else {
        this.expanded = true;
        this.bodyTextarea.focus();
        this.body.hide();

        this.assignBody(this.candidate.body());
        this.assignDetails(this.candidate.details());

        this.saveButton.attr('disabled', true);
        this.expandArrow.addClass('expanded');
        this.addClass("expanded")
        this.expandedInfoSpacer.show();
        this.expandedInfo.slideDown('fast', _.repeat(function() {
          this.bodyTextarea.keyup();
          this.detailsTextarea.keyup();
        }, this));
      }
    },

    enableOrDisableSaveButton: function() {
      if (this.fieldsAreClean()) {
        this.saveButton.attr('disabled', true);
      } else {
        this.saveButton.attr('disabled', false);
      }
    },

    deferredEnableOrDisableSaveButton: function() {
      this.defer(function() {
        this.enableOrDisableSaveButton();
      });
    },

    fieldsAreClean: function() {
      return this.bodyTextarea.val() === this.candidate.body()
        && this.detailsTextarea.val() === this.candidate.details();
    },

    saveCandidate: function() {
      this.startLoading();
      this.saveButton.attr('disabled', true);
      this.candidate.update({
        body: this.bodyTextarea.val(),
        details: this.detailsTextarea.val()
      })
        .onSuccess(function() {
          this.stopLoading();
          this.expandOrContract();
        }, this);
    },

    destroyCandidate: function() {
      this.startLoading();
      this.candidate.destroy()
        .onSuccess(function() {
          this.stopLoading();
        }, this);
    },

    startLoading: function() {
      this.previouslyVisibleIcons = this.find('.candidateIcon:visible');
      this.previouslyVisibleIcons.hide();
      this.loadingIcon.show();
    },

    stopLoading: function() {
      this.loadingIcon.hide();
      this.previouslyVisibleIcons.show();
    },

    assignBody: function(body) {
      this.body.html(body);
      this.bodyTextarea.val(body);
      this.bodyTextarea.keyup();
      this.nonEditableBody.html(body);
    },

    assignDetails: function(details) {
      this.detailsTextarea.val(details);
      this.detailsTextarea.keyup();
      this.nonEditableDetails.html(htmlEscape(details));
    }
  }
});
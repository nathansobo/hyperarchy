_.constructor("Views.CandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({ candidateId: candidate.id(), 'class': "candidate " + this.additionalClass }, function() {
      if (candidate.belongsToCurrentUser()) {
        div({'class': "expandArrow"})
          .ref('expandArrow')
          .click('expandOrContract');
      }

      div({'class': "loading candidateIcon", style: "display: none;"}).ref('loadingIcon');
      template.candidateIcon();

      div({'class': "bodyContainer"}, function() {
        textarea({style: "display: none;"}, candidate.body())
          .keydown(function(view, e) {
            if (e.keyCode == 13) {
              view.saveCandidate();
              e.preventDefault();
            }
          })
          .bind('keyup paste', "enableOrDisableSaveButton")
          .ref('bodyTextarea');
        span({'class': "body"}, candidate.body()).ref('body');
      }).ref('bodyContainer');


      div({'class': "expandedInfo", style: "display: none;"}, function() {
        button("Save")
          .ref('saveButton')
          .click("saveCandidate");
        button({style: "float: right"}, "Delete").click("deleteCandidate");
        div({'class': "clear"});
      }).ref('expandedInfo');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.subscriptions = new Monarch.SubscriptionBundle;
      this.subscriptions.add(this.candidate.remote.field('body').onUpdate(function(newBody) {
        this.body.html(newBody)
      }, this));

      this.defer(function() {
        this.bodyTextarea.elastic();
      });
    },

    afterRemove: function() {
      this.subscriptions.destroy();
    },

    expandOrContract: function() {
      if (this.expanded) {
        this.expanded = false;
        this.bodyTextarea.hide();
        this.body.show();
        this.expandArrow.removeClass('expanded');
        this.expandedInfo.slideUp('fast');
      } else {
        this.expanded = true;
        this.bodyTextarea.show();
        this.bodyTextarea.focus();
        this.bodyTextarea.keyup();
        this.bodyTextarea.val(this.candidate.body());
        this.body.hide();
        this.saveButton.attr('disabled', true);
        this.expandArrow.addClass('expanded');
        this.expandedInfo.slideDown('fast');
      }
    },

    enableOrDisableSaveButton: function() {
      if (this.bodyTextarea.val() === this.candidate.body()) {
        this.saveButton.attr('disabled', true);
      } else {
        this.saveButton.attr('disabled', false);
      }
    },

    saveCandidate: function() {
      this.startLoading();
      this.saveButton.attr('disabled', true);
      this.candidate.update({ body: this.bodyTextarea.val() })
        .onSuccess(function() {
          this.stopLoading();
          this.expandOrContract();
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
    }
  }
});
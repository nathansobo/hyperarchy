_.constructor("Views.CandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({ candidateId: candidate.id(), 'class': "candidate " + this.additionalClass }, function() {
      if (candidate.belongsToCurrentUser()) {
        div({'class': "expandArrow"})
          .ref('expandArrow')
          .click('expandOrContract');
      }

      template.candidateIcon();

      div({'class': "bodyContainer"}, function() {
        textarea({style: "display: none;"}, candidate.body()).ref('bodyTextarea');
        span({'class': "body"}, candidate.body()).ref('body');
      }).ref('bodyContainer');


      div({'class': "expandedInfo", style: "display: none;"}, function() {
        button({style: "float: right; margin-right: 5px;"}, "Save").click("editCandidate");
        button({style: "float: right"}, "Delete").click("deleteCandidate");

        div({'class': "clear"});
      }).ref('expandedInfo');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.defer(function() {
        this.bodyTextarea.elastic();
      });
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
        this.bodyTextarea.keyup();
        this.body.hide();
        this.expandArrow.addClass('expanded');
        this.expandedInfo.slideDown('fast');
      }
    }
  }
});
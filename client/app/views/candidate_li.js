_.constructor("Views.CandidateLi", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({ candidateId: candidate.id(), 'class': "candidate " + this.additionalClass }, function() {
      div({'class': "expandArrow"})
        .ref('expandArrow')
        .click('expandOrContract');
      template.candidateIcon();
      span({'class': "body"}, candidate.body());

      div({'class': "expandedInfo", style: "display: none;"}, function() {
        label({'for': "candidateDetails"}, "Details:");
        textarea({name: "candidateDetails"});
      }).ref('expandedInfo');
    });
  }},

  viewProperties: {
    expandOrContract: function() {
      if (this.expanded) {
        this.expanded = false;
        this.expandArrow.removeClass('expanded');
        this.expandedInfo.slideUp('fast');
      } else {
        this.expanded = true;
        this.expandArrow.addClass('expanded');
        this.expandedInfo.slideDown('fast');
      }
    }
  }
});
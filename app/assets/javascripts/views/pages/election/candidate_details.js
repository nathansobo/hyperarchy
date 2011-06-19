_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"}, function() {
      div({'class': "body"}).ref("body");
      div({'class': "details"}).ref("details");
    });
  }},

  viewProperties: {

    candidate: {
      change: function(candidate) {
        this.body.bindText(candidate, 'body');
        this.details.bindText(candidate, 'details');
      }
    }
  }
});

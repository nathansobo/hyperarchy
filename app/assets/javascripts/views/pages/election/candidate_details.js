_.constructor('Views.Pages.Election.CandidateDetails', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: "candidate-details"});
  }},

  viewProperties: {
    propertyAccessors: ['candidate']
  }
});

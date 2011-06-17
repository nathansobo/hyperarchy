_.constructor('Views.Pages.Election.VoteLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "vote"}, params.vote.id());
  }},

  viewProperties: {

  }
});

_.constructor("Views.Candidate", View.Template, {
  content: function(params) { with(this.builder) {
    var candidate = params.candidate;
    li({'class': "candidate", candidateId: candidate.id()}, function() {
      div({'class': "unrankCandidate"});
      span({'class': "candidateBody"}, candidate.body());
    });
  }}
});
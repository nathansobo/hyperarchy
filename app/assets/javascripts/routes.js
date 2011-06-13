Path.map('/organizations/:id').to(function() {
  Application.showPage('organization', parseInt(this.params.id));
});

Path.map('/elections/:id').to(function() {
  Application.showPage('election', parseInt(this.params.id));
});

Path.map('/elections/:electionId/candidates/:selectedCandidateId').to(function() {
  Application.showPage('election', parseInt(this.params.electionId));
  Application.electionPage.currentConsensus.selectedCandidateId(parseInt(this.params.selectedCandidateId));
});

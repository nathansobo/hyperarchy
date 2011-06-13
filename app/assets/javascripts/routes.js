Path.map('/organizations/:id').to(function() {
  Application.showPage('organization', parseInt(this.params.id));
});

Path.map('/elections/:id').to(function() {
  Application.showPage('election', parseInt(this.params.id));
});

Path.map('/elections/:election_id/candidates/:candidate_id').to(function() {
  Application.showPage('election', parseInt(this.params.election_id));
});

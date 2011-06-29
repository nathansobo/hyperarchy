Path.map('/organizations/:organizationId').to(function() {
  Application.showPage('organization', this.params);
});

Path.map('/organizations/:organizationId/elections/new').to(function() {
  Application.showPage('election', { organizationId: this.params.organizationId, electionId: 'new'});
});

Path.map('/elections/:electionId').to(function() {
  Application.showPage('election', this.params);
});
                                           // also handles 'new'
Path.map('/elections/:electionId/candidates/:candidateId').to(function() {
  Application.showPage('election', this.params);
});

Path.map('/elections/:electionId/votes/:voterId').to(function() {
  Application.showPage('election', this.params);
});

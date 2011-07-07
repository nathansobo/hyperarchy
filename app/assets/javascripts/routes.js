Path.map('/').to(function() {
  _.defer(function() {
    History.replaceState(null, null, Application.currentUser().defaultOrganization().url());
  })
});

Path.map('/organizations/:organizationId').to(function() {
  Application.showPage('organization', this.params);
});

Path.map('/organizations/:organizationId/settings').to(function() {
  Application.showPage('organizationSettings', this.params);
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

Path.map('/account').to(function() {
  function showAccountPage() {
    Application.showPage('account', {userId: Application.currentUserId()});
  }

  var currentUser = Application.currentUser();

  if (currentUser.guest()) {
    Application.promptLogin()
      .success(showAccountPage)
      .invalid(function() {
        History.pushState(null, null, currentUser.defaultOrganization().url());
      });
  } else {
    showAccountPage();
  }
});

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

Path.map('/organizations/:organizationId/questions/new').to(function() {
  Application.showPage('question', { organizationId: this.params.organizationId, questionId: 'new'});
});

Path.map('/questions/:questionId').to(function() {
  Application.showPage('question', this.params);
});
                                           // also handles 'new'
Path.map('/questions/:questionId/answers/:answerId').to(function() {
  Application.showPage('question', this.params);
});

Path.map('/questions/:questionId/votes/:voterId').to(function() {
  Application.showPage('question', this.params);
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

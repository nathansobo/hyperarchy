_.constructor("Views.Account", View.Template, {
  content: function() { with(this.builder) {

    div({id: 'account'}, function() {
      subview('emailPreferences', Views.SortedList, {
        buildElement: function(membership) {
          return Views.EmailPreferences.toView({membership: membership});
        }
      });
      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'account',
    navigate: function() {
      Application.layout.showAlternateNavigationBar("Account Preferences");
      Application.ensureCurrentUserIsMember()
        .onSuccess(function() {
          this.emailPreferences.relation(Application.currentUser().memberships().orderBy('id asc'));
          Application.layout.hideSubNavigationContent();
        }, this)
        .onFailure(function() {
          Application.layout.goToLastOrganization();
        });
    }
  }
});
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
      if (Application.currentUser().guest()) Application.layout.goToLastOrganization();
      Application.layout.showAlternateNavigationBar("Account Preferences");
      this.emailPreferences.relation(Application.currentUser().memberships().orderBy('id asc'));
      Application.layout.hideSubNavigationContent();
    }
  }
});
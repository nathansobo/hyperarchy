_.constructor("Views.Account", View.Template, {
  content: function() { with(this.builder) {

    div({id: 'account', 'class': "container12"}, function() {
      div({'class': "grid12"}, function() {
        h1("Account Settings");
        subview('emailPreferences', Views.SortedList, {
          buildElement: function(membership) {
            return Views.EmailPreferences.toView({membership: membership});
          }
        });
      });
      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'account',

    navigate: function() {
      Application.layout.showAlternateHeader("Account Preferences");
      this.emailPreferences.relation(Application.currentUser().memberships().orderBy('id asc'));

      Application.layout.showSubheaderContent('');
    }
  }
});
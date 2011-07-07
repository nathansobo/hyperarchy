_.constructor('Views.Pages.OrganizationSettings.MembershipLi', Monarch.View.Template, {
  content: function() { with(this.builder) {
    tr(function() {
      td().ref('name');
      td().ref('emailAddress');
      td(function() {
        select({name: "role"}, function() {
          option({'value': "member"}, "Member");
          option({'value': "owner"}, "Owner");
        }).ref('role').change("save");
      });
      td(function() {
        a({'class': "destroy button"}, "Remove").ref("destroyButton").click("destroy");
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.registerInterest(this.membership.user(), "onUpdate", this.hitch('populateUserData'));
      this.populateUserData();
      this.model(this.membership);
    },

    populateUserData: function() {
      var user = this.membership.user();
      this.name.text(user.fullName());
      this.emailAddress.text(user.emailAddress());
    },

    destroy: function() {
      this.membership.destroy();
    }
  }
});

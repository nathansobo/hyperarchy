_.constructor('Views.Layout.OrganizationsMenu', View.Template, {
  content: function() { with(this.builder) {
    div({'class': "dropdown-menu"}, function() {
      a({id: "add-organization-link"}, "Add Your Organization").ref('addOrganizationLink').click("showAddOrganizationForm");
      a({id: "dropdown-link"}, "Organizations").ref('dropdownLink').click("showDropdown");
      ul({'class': "dropdown"}, function() {
      }).ref("dropdown");
    });
  }},

  viewProperties: {
    initialize: function() {
      this.userSubscriptions = new Monarch.SubscriptionBundle();
    },

    attach: function() {
      Application.signal('currentUser').change(function(user) {
        this.showOrHideDropdownLink();
        this.userSubscriptions.destroy();
        this.userSubscriptions.add(user.organizations().onInsert(this.hitch('showOrHideDropdownLink')));
        this.userSubscriptions.add(user.organizations().onRemove(this.hitch('showOrHideDropdownLink')));
      }, this);
    },

    showOrHideDropdownLink: function() {
      if (Application.currentUser().organizations().size() > 1) {
        this.dropdownLink.show();
        this.addOrganizationLink.hide();
      } else {
        this.dropdownLink.hide();
        this.addOrganizationLink.show();
      }
    }
  }
});


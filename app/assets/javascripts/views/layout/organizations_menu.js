_.constructor('Views.Layout.OrganizationsMenu', View.Template, {
  content: function() { with(this.builder) {
    div({'class': "dropdown-menu"}, function() {
      a({id: "add-organization-link"}, "Add Your Organization").ref('addOrganizationLink').click("showAddOrganizationForm");
      subview("dropdownMenu", Views.Layout.DropdownMenu, {
        linkContent: function() {
          this.builder.text("Organizations");
        },

        menuContent: function() {
          
        }
      });
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
        this.dropdownMenu.show();
        this.addOrganizationLink.hide();
      } else {
        this.dropdownMenu.hide();
        this.addOrganizationLink.show();
      }
    },

    showAddOrganizationForm: function() {
      Application.signupForm.show();
      Application.signupForm.showOrganizationSection();
    }
  }
});


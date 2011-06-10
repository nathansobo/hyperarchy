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
    attach: function() {
      Application.signal('currentUser').change(function(user) {
        if (user.organizations().size() > 1) {
          this.dropdownLink.show();
          this.addOrganizationLink.hide();
        } else {
          this.dropdownLink.hide();
          this.addOrganizationLink.show();
        }
      }, this);
    }
  }
});


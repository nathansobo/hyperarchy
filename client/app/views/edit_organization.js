_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "editOrganization"}, function() {
      h2("Organization Settings")

      label({'for': "name"}, "Name");
      input({name: "name", 'class': "text"})
        .ref('nameField')
        .keydown(function(view, e) {
          if (e.keyCode === 13) {
            view.saveOrganization();
            e.preventDefault();
          }
        })
        .keyup('enableOrDisableSaveButton');
      label({'for': "description"}, "Description (Optional)");
      textarea({name: "description", 'class': "text"})
        .ref('descriptionField')
        .keyup('enableOrDisableSaveButton');

      div(function() {
        label({'for': "privacy"}, "Privacy setting");
        select({name: "privacy"}, function() {
          option({value: "private"}, "All members must be invited");
          option({value: "read_only"}, "Guests can view, but must be invited to participate");
          option({value: "public"}, "Anyone can sign up and participate");
        }).ref('privacySelect')
          .change('enableOrDisableSaveButton')
          .change('enableOrDisableMembersCanInviteCheckbox');
      });

      div({id: "flags"}, function() {
        div(function() {
          input({id: "membersCanInvite", type: "checkbox", name: "membersCanInvite"})
            .ref("membersCanInvite")
            .change('enableOrDisableSaveButton');
          label({'for': "membersCanInvite"}, "Allow any member to invite new people to join the organization.")
            .ref("membersCanInviteLabel")
        });
      });

      button("Save Changes")
        .ref('saveChangesButton')
        .click('saveOrganization');

      div({'class': "loading", style: "display: none"}).ref('loading');

      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'editOrganization',

    initialize: function() {
      this.defer(function() {
        this.find('textarea').elastic();
      });
    },

    navigate: function(state) {
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.model(Organization.find(organizationId));
      this.saveChangesButton.attr('disabled', true);
      this.enableOrDisableMembersCanInviteCheckbox();
      
      Application.layout.activateNavigationTab("editOrganizationLink");
      Application.layout.hideSubNavigationContent();
    },

    saveOrganization: function() {
      this.saveChangesButton.attr('disabled', true);
      this.loading.show();
      this.save().onSuccess(function(organization) {
        this.loading.hide();
      }, this);
    },

    enableOrDisableSaveButton: function() {
      if (this.fieldValuesMatchModel()) {
        this.saveChangesButton.attr('disabled', true);
      } else {
        this.saveChangesButton.removeAttr('disabled');
      }
    },

    enableOrDisableMembersCanInviteCheckbox: function() {
      if (this.privacySelect.val() === "public") {
        this.membersCanInvite.attr('disabled', true);
        this.membersCanInviteLabel.addClass('disabledText');
      } else {
        this.membersCanInvite.attr('disabled', false);
        this.membersCanInviteLabel.removeClass('disabledText');
      }
    }
  }
});
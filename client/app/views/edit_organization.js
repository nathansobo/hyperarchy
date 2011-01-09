_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "editOrganization"}, function() {
      div({'class': "grid12"}, function() {
        div({id: "details", 'class': "largeFont"}, function() {
          label({'for': "name"}, "Organization Name");
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

          div({id: "flags"}, function() {
            div(function() {
              input({id: "membersCanInvite", type: "checkbox", name: "membersCanInvite"})
                .ref("membersCanInvite")
                .change('enableOrDisableSaveButton');
              label({'for': "membersCanInvite"}, "Allow members to invite other people to join the organization.")
            });
          });


          button("Save Changes")
            .ref('saveChangesButton')
            .click('saveOrganization');
          div({'class': "loading", style: "display: none"}).ref('loading');
        }).ref("details");
      });

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
      
      Application.layout.activateNavigationTab("editOrganizationLink");
      Application.layout.showSubNavigationContent("");
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
    }
  }
});
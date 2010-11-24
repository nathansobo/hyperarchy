_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "editOrganization"}, function() {
      div({id: "details", 'class': "grid5 largeFont"}, function() {
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
        button("Save Changes")
          .ref('saveChangesButton')
          .click('saveOrganization');
        div({'class': "loading", style: "display: none"}).ref('loading');
      });

      div({'class': "grid7"}, function() {
        a({'class': "glossyBlack roundedButton", id: "overviewLink"}, "View Questions")
          .ref('overviewLink')
          .click(function(view, e) {
            $.bbq.pushState({view: "organization", organizationId: view.model().id()});
            e.preventDefault();
          });
      });

      div({'class': "grid12"}, function() {
        label("Members");

        div({'class': "addMember"}, function() {
          input({'class': "name", type: "text", placeholder: "First Name"}).ref('createMembershipFirstName');
          input({'class': "name", type: "text", placeholder: "Last Name"}).ref('createMembershipLastName');
          input({'class': "emailAddress", type: "text", placeholder: "Email Address"})
            .keyup('enableOrDisableCreateMembership')
            .ref('createMembershipEmail');
          select(function() {
            option({value: "member"}, "Member");
            option({value: "owner"}, "Owner");
          }).ref("createMembershipRole");
          button({disabled: true}, "Add")
            .ref('createMembershipButton')
            .click('createMembership');
        }).ref('addMemberSection');

        table({'class': "members"}, function() {
          thead(function() {
            tr(function() {
              th("Name");
              th("Email Address");
              th("Role");
              th("Invitation");
              th("");
            })
          });

          subview('membersTbody', Views.SortedList, {
            rootTag: 'tbody',
            placeholderTag: 'tbody',
            buildElement: function(membership) {
              return Views.MembershipTr.toView({membership: membership});
            }
          });
        });
      });
    });
  }},

  viewProperties: {
    viewName: 'editOrganization',

    initialize: function() {
      this.createMembershipFirstName.placeHeld();
      this.createMembershipLastName.placeHeld();
      this.createMembershipEmail.placeHeld();
      this.subscriptions = new Monarch.SubscriptionBundle();
      this.defer(function() {
        this.find('textarea').elastic();
      });

      this.addMemberSection.find('input,select').keyup(this.bind(function(e) {
        if (e.keyCode === 13) {
          if (this.createMembershipButton.is(":enabled")) this.createMembership();
          e.preventDefault();
        }
      }));
    },

    navigate: function(state) {
      var organizationId = state.organizationId;
      Server.fetch([
        Organization.where({id: organizationId}),
        Membership.where({organizationId: organizationId})
      ]).onSuccess(function() {
        this.model(Organization.find(state.organizationId));
      }, this);
    },

    modelAssigned: function(organization) {
      Application.currentOrganizationId(organization.id());
      this.subscriptions.destroy();
      this.saveChangesButton.attr('disabled', true);
      this.membersTbody.relation(organization.memberships());
    },

    createMembership: function() {
      this.model().memberships().create({
        firstName: this.createMembershipFirstName.val(),
        lastName: this.createMembershipLastName.val(),
        emailAddress: this.createMembershipEmail.val(),
        role: this.createMembershipRole.val()
      });

      this.createMembershipFirstName.val("");
      this.createMembershipLastName.val("");
      this.createMembershipEmail.val("");
      this.enableOrDisableCreateMembership();
      this.createMembershipFirstName.focus();
    },

    saveOrganization: function() {
      this.saveChangesButton.attr('disabled', true);
      this.loading.show();
      this.save().onSuccess(function() {
        this.loading.hide();
      }, this);
    },

    enableOrDisableCreateMembership: function() {
      if (this.createMembershipEmail.val().match(/.+@.+\..+/)) {
        this.createMembershipButton.attr('disabled', false);
      } else {
        this.createMembershipButton.attr('disabled', true);
      }
    },

    enableOrDisableSaveButton: function() {
      var valuesDiffer =
        this.nameField.val() !== this.model().name() ||
          this.descriptionField.val() !== this.model().description();

      if (valuesDiffer) {
        this.saveChangesButton.attr('disabled', false);
      } else {
        this.saveChangesButton.attr('disabled', true);
      }
    }
  }
});
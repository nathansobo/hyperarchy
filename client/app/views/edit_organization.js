_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "editOrganization"}, function() {
      div({'class': "grid5 largeFont bigMarginBottom"}, function() {
        label({'for': "name"}, "Organization Name");
        input({name: "name", 'class': "text"});
        label({'for': "description"}, "Description (Optional)");
        textarea({name: "description", 'class': "text"});
        input({type: "submit", value: "Save Changes"})
          .ref('createOrganizationButton')
          .click('createOrganization');
      });

      div({'class': "grid12"}, function() {
        label({'class': "largeFont block"}, "Members");

        div({'class': "addMember marginBottom"}, function() {
          input({'class': "name", type: "text", placeholder: "First Name"}).ref('createMembershipFirstName');
          input({'class': "name", type: "text", placeholder: "Last Name"}).ref('createMembershipLastName');
          input({'class': "emailAddress", type: "text", placeholder: "Email Address"}).ref('createMembershipEmail');
          select(function() {
            option("Member");
            option("Owner");
          }).ref("createMembershipRole");
          input({type: "submit", value: "Add"}).click('createMembership');
        });

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

          tbody(function() {

          }).ref("membersTbody");
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
    },

    navigate: function(state) {
      var organizationId = state.organizationId;
      Server.fetch([
        Organization.where({id: organizationId}),
        Membership.where({organizationId: organizationId}).joinTo(User)
      ]).onSuccess(function() {
        this.model(Organization.find(state.organizationId));
      }, this);
    },

    modelAssigned: function(model) {
      this.membersTbody.empty();
      this.model().memberships().each(this.hitch('appendMembershipTr'));
    },

    appendMembershipTr: function(membership) {
      this.membersTbody.appendView(function(b) {
        b.tr(function() {
          b.td(membership.fullName());
          b.td(membership.emailAddress());
          b.td(function() {
            b.select(function() {
              b.option("Member", {selected: membership.role() === "member"});
              b.option("Owner", {selected: membership.role() === "owner"});
            });
          });
          b.td("No Pending Invitations");
          b.td(function() {
            b.a({href: "#"}, "Remove");
          });
        })
      });
    },

    createMembership: function() {
      this.model().memberships().create({
        firstName: this.createMembershipFirstName.val(),
        lastName: this.createMembershipLastName.val(),
        emailAddress: this.createMembershipEmail.val(),
        role: this.createMembershipRole.val()
      }).onSuccess(this.hitch('appendMembershipTr'));
    }
  }
});
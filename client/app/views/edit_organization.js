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
          div({'class': "searchInput"}, function() {
            input({'class': "searchInput"});
            span({'class': "grayText smallFont"}, "e.g. John Smith, john@example.com, John Smith <john@example.com>");
          });

          select(function() {
            option("Member");
            option("Owner");
          });

          input({type: "submit", value: "Add"});
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

      this.model().memberships().each(function(membership) {
        var user = membership.user();
        this.membersTbody.appendView(function(b) {
          b.tr(function() {
            b.td(user.fullName());
            b.td(user.emailAddress());
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
      }, this);
    },

    createOrganization: function() {
      Organization.create(this.fieldValues())
        .onSuccess(function(organization) {
          Application.currentUser().memberships().where({organizationId: organization.id()}).fetch()
            .onSuccess(function() {
              $.bbq.pushState({view: 'invite', checkOrganization: organization.id()});
            });
        });
    }
  }
});
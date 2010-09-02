_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "editOrganization"}, function() {
      div({'class': "grid5 largeFont bigMarginBottom"}, function() {
        label({'for': "name"}, "Organization Name");
        input({name: "name", 'class': "text"});
        label({'for': "description"}, "Description (Optional)");
        textarea({name: "description", 'class': "text"});
        button("Save Changes")
          .ref('saveChangesButton')
          .click('saveChanges');
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
          input({'class': "emailAddress", type: "text", placeholder: "Email Address"}).ref('createMembershipEmail');
          select(function() {
            option({value: "member"}, "Member");
            option({value: "owner"}, "Owner");
          }).ref("createMembershipRole");
          button("Add").click('createMembership');
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
        Membership.where({organizationId: organizationId})
      ]).onSuccess(function() {
        this.model(Organization.find(state.organizationId));
      }, this);
    },

    modelAssigned: function(model) {
      this.membersTbody.empty();
      this.model().memberships().each(this.hitch('appendMembershipTr'));
    },

    appendMembershipTr: function(membership) {
      var membershipTr = Monarch.View.build(function(b) {
        b.tr(function() {
          b.td(membership.fullName());
          b.td(membership.emailAddress());
          b.td({'class': "role"}, function() {
            if (membership.user() !== Application.currentUser()) {
              b.select(function() {
                b.option({selected: membership.role() === "member", value: "member"}, "Member");
                b.option({selected: membership.role() === "owner", value: "owner"}, "Owner");
              }).change(function(view) {
                view.roleChangePending.removeClass('inactive');
                membership.update({role: this.val()}).onSuccess(function() {
                  view.roleChangePending.addClass('inactive');
                });
              });
              b.div({'class': "loading inactive"}).ref('roleChangePending');
            } else {
              b.text(_.capitalize(membership.role()));
            }
          });
          b.td(membership.pending() ? "Pending" : "Accepted");
          b.td({'class': "remove"}, function() {
            if (membership.user() !== Application.currentUser()) {
              b.a({href: "#"}, "Remove").click(function(view) {
                view.destroyPending.removeClass('inactive');
                membership.destroy().onSuccess(function() {
                  membershipTr.remove();
                }, this);
                return false;
              });
              b.div({'class': "loading inactive"}).ref('destroyPending');
            }
          });
        })
      });

      this.membersTbody.append(membershipTr);
    },

    createMembership: function() {
      this.model().memberships().create({
        firstName: this.createMembershipFirstName.val(),
        lastName: this.createMembershipLastName.val(),
        emailAddress: this.createMembershipEmail.val(),
        role: this.createMembershipRole.val()
      }).onSuccess(this.hitch('appendMembershipTr'));

      this.createMembershipFirstName.val("");
      this.createMembershipLastName.val("");
      this.createMembershipEmail.val("");
    }
  }
});
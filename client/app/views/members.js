_.constructor("Views.Members", View.Template, {
  content: function() { with(this.builder) {
    div({id: "members"}, function() {
      div({'class': "addMember"}, function() {
        h2("Add a Member");
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
        div({'class': "loading", style: "display: none"}).ref('creatingMembership');
      }).ref('addMemberSection');

      h2("Current Members");
      table({'class': "members"}, function() {
        thead(function() {
          tr(function() {
//              th("");
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

      div({'class': "clear"});

    });
  }},

  viewProperties: {
    viewName: 'members',

    initialize: function() {
      this.createMembershipFirstName.placeHeld();
      this.createMembershipLastName.placeHeld();
      this.createMembershipEmail.placeHeld();
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
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.model(Organization.find(organizationId));

      Application.layout.activateNavigationTab("membersLink");
      Application.layout.hideSubNavigationContent();
    },

    modelAssigned: function(organization) {
      organization.memberships().fetch().onSuccess(function() {
        this.membersTbody.relation(organization.memberships());
      }, this);
    },

    createMembership: function() {
      this.creatingMembership.show();
      this.model().memberships().create({
        firstName: this.createMembershipFirstName.val(),
        lastName: this.createMembershipLastName.val(),
        emailAddress: this.createMembershipEmail.val(),
        role: this.createMembershipRole.val()
      }).onSuccess(function() {
        this.creatingMembership.hide();
      }, this);

      this.createMembershipFirstName.val("");
      this.createMembershipLastName.val("");
      this.createMembershipEmail.val("");
      this.enableOrDisableCreateMembership();
      this.createMembershipFirstName.focus();
    },

    enableOrDisableCreateMembership: function() {
      if (this.createMembershipEmail.val().match(/.+@.+\..+/)) {
        this.createMembershipButton.attr('disabled', false);
      } else {
        this.createMembershipButton.attr('disabled', true);
      }
    }
  }
});
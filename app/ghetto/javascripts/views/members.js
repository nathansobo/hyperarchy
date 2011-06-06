_.constructor("Views.Members", View.Template, {
  content: function() { with(this.builder) {
    div({id: "members", 'class': "grid12"}, function() {
      div({'class': 'newMembers'}, function() {
        h2("Invite New Members");
        div({id: "secretUrlExplanation"}, "Share this private link with your team to invite more members:");
        input({'class': "secretUrl", readonly: "readonly"}, "").ref('secretUrl');
      });

      div({'class': 'currentMembers'}, function() {
        h2("Current Members");
        table({'class': "members"}, function() {
          thead(function() {
            tr(function() {
              th("Name");
              th("Email Address");
              th("Role");
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

      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'members',

    initialize: function() {},

    navigate: function(state) {
      var organizationId = parseInt(state.organizationId);
      Application.currentOrganizationId(organizationId);
      this.model(Organization.find(organizationId));

      Application.layout.activateNavigationTab("membersLink");
      Application.layout.hideSubNavigationContent();
      this.secretUrl.val(Application.currentOrganization().secretUrl());
      console.log(this.secretUrl.caret());
      this.selectSecretUrl();
      this.secretUrl.mouseup(this.hitch('selectSecretUrl'));
    },

    modelAssigned: function(organization) {
      organization.memberships().joinTo(User).fetch().onSuccess(function() {
        var nonGuestMemberships = organization.memberships().where(Membership.firstName.neq("Guest"));
        this.membersTbody.relation(nonGuestMemberships);
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
    },

    selectSecretUrl: function(e) {
      if (e) e.preventDefault();
      this.secretUrl.caret(0, this.secretUrl.val().length);
    }
  }
});

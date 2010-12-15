_.constructor("Views.EditOrganization", View.Template, {
  content: function() { with(this.builder) {
    div({id: "editOrganization"}, function() {
      div({id: "organizationHeader", 'class': "grid12"}, function() {
        a({'class': "glossyBlack roundedButton", id: "overviewLink"}, "Back To Questions")
          .ref('overviewLink')
          .click(function(view, e) {
            $.bbq.pushState({view: "organization", organizationId: view.model().id()});
            e.preventDefault();
          });
      });

      div({'class': "grid12"}, function() {
        ol({id: "tabs"}, function() {
          li({'class': "tab"}, function() {
            span({'class': "dropShadow"}, "Organization Details")
              .ref("detailsTab")
              .click(function() {
                $.bbq.pushState({tab: "details"});
              });
          });
          li({'class': "tab"}, function() {
            span({'class': "dropShadow selected"}, "Members")
              .ref("membersTab")
              .click(function() {
                $.bbq.pushState({tab: "members"});
              });
          });
        }).ref("tabs");

        div({id: "content", 'class': "dropShadow"}, function() {
          div({id: "details", 'class': "largeFont", style: "display: none"}, function() {
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

            div({id: "membersCanInviteSection"}, function() {
              input({id: "membersCanInvite", type: "checkbox", name: "membersCanInvite"})
                .ref("membersCanInvite")
                .change('enableOrDisableSaveButton');
              label({'for': "membersCanInvite"}, "Allow members to invite other people to join the organization.")

              input({id: "useSssl", type: "checkbox", name: "useSsl"})
                .ref("useSsl")
                .change('enableOrDisableSaveButton');
              label({'for': "useSsl"}, "Use SSL for this organization.");
            });


            button("Save Changes")
              .ref('saveChangesButton')
              .click('saveOrganization');
            div({'class': "loading", style: "display: none"}).ref('loading');
          }).ref("details");


          div({id: "members", style: "display: none;"}, function() {
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
              div({'class': "loading", style: "display: none"}).ref('creatingMembership');
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
          }).ref("members");
        }).ref("content");
      });
      div({'class': "clear"});
    });
  }},

  viewProperties: {
    viewName: 'editOrganization',

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
      this.tabs.find("span").removeClass("selected");
      this.content.children().hide();

      if (state.tab === "members") {
        this.membersTab.addClass("selected");
        this.members.show();
      } else {
        this.detailsTab.addClass("selected");
        this.details.show();
      }
    },

    modelAssigned: function(organization) {
      organization.memberships().fetch().onSuccess(function() {
        this.saveChangesButton.attr('disabled', true);
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
          this.descriptionField.val() !== this.model().description() ||
            this.membersCanInvite.is(":checked") !== this.model().membersCanInvite();

      if (valuesDiffer) {
        this.saveChangesButton.attr('disabled', false);
      } else {
        this.saveChangesButton.attr('disabled', true);
      }
    }
  }
});
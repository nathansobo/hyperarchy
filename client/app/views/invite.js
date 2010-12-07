_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite", 'class': "dropShadow", style: "display: none;"}, function() {
      div({'class': "dismissX"}).click('hide');

      div({id: "instructions", 'class': "largeFont"},
        "Enter one or more email addresses, separated by commas:"
      );

      div(function() {
        textarea().ref('emailAddresses');
      });

      div({'class': "clear"});

      div({id: "whichOrganizations"}, "Which organizations should we invite them to join?");


      subview('organizations', Views.SortedList, {
        buildElement: function(organization) {
          var parentView = this.parentView;
          return Monarch.View.build(function(b) {
            var checkboxId = "inviteTo" + organization.id();
            b.li(function() {
              b.input({type: "checkbox", checked: true, value: organization.id(), id: checkboxId}).change(parentView.hitch('disableOrEnableCheckboxes'));
              b.label({'for': checkboxId},  organization.name());
            });
          });
        }
      });

      a({'class': "glossyBlack roundedButton", href: "#"}, 'Send Invitations').ref('sendInvitationsButton').click('sendInvitations');
    });
  }},

  viewProperties: {
    initialize: function() {
      this.defer(function() {
        this.emailAddresses.elastic();
      });
    },

    beforeShow: function() {
      this.organizations.relation(Application.currentUser().organizationsPermittedToInvite());
      this.disableOrEnableCheckboxes();
      $("#darkenBackground").one('click', this.hitch('hide'));
    },

    disableOrEnableCheckboxes: function() {
      var checkedBoxes = this.organizations.find(":checked");
      if (checkedBoxes.length === 1) {
        checkedBoxes.attr('disabled', true);
      } else {
        checkedBoxes.attr('disabled', false);
      }
    },

    afterHide: function() {
      $("#darkenBackground").hide();
    },

    organizationIds: function() {
      return this.organizations.find(":checked").map(function() {
        return $(this).val();
      }).toArray();
    },

    sendInvitations: function() {
      this.sendInvitationsButton.attr('disabled', true);
      Server.post("/invite", { email_addresses: this.emailAddresses.val(), organization_ids: this.organizationIds() })
        .onSuccess(function() {
          this.sendInvitationsButton.attr('disabled', false);
          this.hide();
        }, this);
    }
  }
});
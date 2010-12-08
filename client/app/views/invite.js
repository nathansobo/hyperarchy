_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite", 'class': "dropShadow", style: "display: none;"}, function() {
      div({'class': "dismissX"}).click('hide');

      div({id: "instructions", 'class': "largeFont"},
        "Enter one or more email addresses, separated by commas:"
      ).ref('instructions');

      div({id: "errorMessage"},
        "Sorry, there was a problem with the format of your email addresses."
      ).ref('errorMessage');

      div(function() {
        textarea().ref('emailAddresses');
      });

      div({'class': "clear"});

      div({id: "whichOrganizations"}, "Which organizations should we invite them to join?");


      subview('organizations', Views.SortedList, {
        buildElement: function(organization) {
          return Monarch.View.build(function(b) {
            var checkboxId = "inviteTo" + organization.id();
            b.li(function() {
              b.input({type: "checkbox", checked: true, value: organization.id(), id: checkboxId});
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
      this.emailAddresses.bind('keydown', 'return', this.bind(function(e) {
        this.sendInvitationsButton.click();
        e.preventDefault();
      }));
    },

    beforeShow: function() {
      this.organizations.relation(Application.currentUser().organizationsPermittedToInvite());
      $("#darkenBackground").one('click', this.hitch('hide'));
      this.instructions.show();
      this.errorMessage.hide();
      this.emailAddresses.val("");
      this.emailAddresses.removeClass("error");
    },

    afterHide: function() {
      $("#darkenBackground").hide();
    },

    organizationIds: function() {
      return this.organizations.find(":checked").map(function() {
        return $(this).val();
      }).toArray();
    },

    sendInvitations: function(elt, e) {
      this.sendInvitationsButton.attr('disabled', true);
      Server.post("/invite", { email_addresses: this.emailAddresses.val(), organization_ids: this.organizationIds() })
        .onSuccess(function() {
          this.sendInvitationsButton.attr('disabled', false);
          this.hide();
        }, this)
        .onFailure(function() {
          this.instructions.hide();
          this.errorMessage.show();
          this.emailAddresses.addClass('error');
        }, this);

      e.preventDefault();
    }
  }
});
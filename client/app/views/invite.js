_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite"}, function() {
      div({'class': "grid6"}, function() {
        textarea({'class': "largeFont"}).ref('emailAddresses');
      });
      div({'class': "grid6 largeFont"},
        "Enter your friends' email addresses, and we'll send them an invitation to join Hyperarchy's alpha testing group. " +
        "They will also be able to add their own organizations. " +
        "If you would like to invite someone as a member of your organization, do that from its admin screen."
      );

      div({'class': "grid12"}, function() {
        button('Send Invitations').ref('sendInvitationsButton').click('sendInvitations');
        span({'class': "grayText"}, "Separate with spaces, line-breaks, or commas");
      });
    });
  }},

  viewProperties: {
    viewName: 'invite',

    navigate: function() {
      this.emailAddresses.val("");
    },

    sendInvitations: function() {
      var emailAddresses = _.filter(this.emailAddresses.val().split(/\s+|\s*,\s*/), function(address) {
        return address !== "";
      });
      if (emailAddresses.length == 0) return;

      this.sendInvitationsButton.attr('disabled', true);
      Server.post("/invite", {email_addresses: emailAddresses})
        .onSuccess(function() {
          this.sendInvitationsButton.attr('disabled', false);
          jQuery.bbq.pushState({view: "organization"});
          window.notify("Thank you. Your invitations have been sent.");
        }, this);
    }
  }
});

_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite"}, function() {
      div({'class': "grid6"}, function() {
        textarea({'class': "largeFont", name: 'email_addresses'});
      });
      div({'class': "grid6 largeFont"}, "Enter your friends' email addresses, and we'll send them an invitation to join Hyperarchy.");

      div({'class': "grid12"}, function() {
        button('Send Invitations');
        span({'class': "grayText"}, "Separate addresses with spaces, line-breaks, or commas");
      });
    });
  }},

  viewProperties: {
    viewName: 'invite'
  }
});

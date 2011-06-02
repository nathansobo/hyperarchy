_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite", 'class': "dropShadow", style: "display: none;"}, function() {
      div({'class': "rightCancelX"}).click('hide');

      div({'class': "instructions largeFont"},
        "Share this link to your team:"
      );

      div(function() {
        textarea({'class': "membershipUrl", readonly: "readonly"}).ref('membershipUrl');
      });

      div({'class': "instructions largeFont"},
        "Or enter one or more email addresses, separated by commas:"
      ).ref('instructions');

      div({id: "errorMessage"},
        "Sorry, there was a problem with the format of your email addresses."
      ).ref('errorMessage');

      div(function() {
        textarea().ref('emailAddresses');
      });

      div({'class': "clear"});

      a({'class': "glossyBlack roundedButton", href: "#"}, 'Send Invitations').ref('sendInvitationsButton').click('sendInvitations');
      div({'class': "loading", style: "display: none;"}).ref('loadingSpinner');
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
      $("#darkenBackground").one('click', this.hitch('hide'));
      this.instructions.show();
      this.errorMessage.hide();
      this.emailAddresses.val("");
      var membershipUrl = Application.currentOrganization().membershipUrl();
      this.membershipUrl.val(membershipUrl);
      this.membershipUrl.focus();
      this.emailAddresses.removeClass("error");
    },

    afterHide: function() {
      $("#darkenBackground").hide();
    },

    sendInvitations: function(elt, e) {
      this.sendInvitationsButton.attr('disabled', true);
      this.loadingSpinner.show();
      Server.post("/invite", {email_addresses: this.emailAddresses.val(),
                              organization_ids: [Application.currentOrganizationId()]})
        .onSuccess(function() {
          this.sendInvitationsButton.attr('disabled', false);
          this.hide();
        }, this)
        .onFailure(function() {
          this.instructions.hide();
          this.errorMessage.show();
          this.emailAddresses.addClass('error');
        }, this)
        .onComplete(function() {
          this.loadingSpinner.hide();
        }, this);

      e.preventDefault();
    }
  }
});

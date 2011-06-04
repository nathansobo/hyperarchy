_.constructor("Views.Invite", View.Template, {
  content: function() { with(this.builder) {
    div({id: "invite", 'class': "dropShadow", style: "display: none;"}, function() {
      div({'class': "rightCancelX"}).click('hide');

      div({'class': "instructions largeFont"},
        "Share this private link with your team to give them access:"
      );

      div(function() {
        input({'class': "secretUrl", readonly: "readonly"}).ref('secretUrl');
      });

      div({'class': "clear"});
    });
  }},

  viewProperties: {
    initialize: function() {
    },

    beforeShow: function() {
      $("#darkenBackground").one('click', this.hitch('hide'));
      var secretUrl = Application.currentOrganization().secretUrl();
      this.secretUrl.val(secretUrl);
      this.secretUrl.focus();
    },

    afterShow: function() {
      this.selectSecretUrl();
      this.secretUrl.mouseup(this.hitch('selectSecretUrl'));
    },

    afterHide: function() {
      $("#darkenBackground").hide();
    },

    selectSecretUrl: function(e) {
      if (e) e.preventDefault();
      this.secretUrl.caret(0, this.secretUrl.val().length);
    }
  }
});

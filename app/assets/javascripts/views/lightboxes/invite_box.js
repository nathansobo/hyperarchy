_.constructor('Views.Lightboxes.InviteBox', Views.Lightboxes.Lightbox, {
  id: "invite-box",

  lightboxContent: function() { with(this.builder) {
    div({id: "invite-explanation"}, "Share this private URL with your team to give them access:");
    input({readonly: true}).ref('secretUrl');
  }},

  viewProperties: {
    afterShow: function() {
      var secretUrl = Application.currentOrganization().secretUrl();
      this.secretUrl.val(secretUrl);
      this.selectSecretUrl();
      this.secretUrl.mouseup(this.hitch('selectSecretUrl'));
    },

    selectSecretUrl: function() {
      this.secretUrl.caret(0, this.secretUrl.val().length);
      return false;
    }
  }
});


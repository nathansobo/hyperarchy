_.constructor('Views.Lightboxes.DisconnectDialog', Views.Lightboxes.Lightbox, {
  id: "disconnect-dialog",

  lightboxContent: function() { with(this.builder) {
    h1(function() {
      raw("Your connection to our server<br/>has been lost.")
    });
    div("To ensure your interface stays up to date, you'll need to refresh the page.");
    a({'class': "button"}, "Refresh").ref('refreshButton').click('hide');
  }},

  viewProperties: {
    afterHide: function() {
      Application.reload();
    }
  }
});

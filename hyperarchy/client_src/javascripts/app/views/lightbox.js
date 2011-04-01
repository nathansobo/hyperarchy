_.constructor("Views.Lightbox", View.Template, {
  content: function() { with(this.builder) {
    div({id: template.id, 'class': "lightbox floatingCard dropShadow", style: "display: none;"}, function() {
      template.lightboxContent();
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.layout.darkenBackground.fadeIn();
      Application.layout.darkenBackground.one('click', this.hitch('hide'));
    },

    afterShow: function() {
      this.position({
        my: "center",
        at: "center",
        of: Application.layout.darkenBackground
      });
    },

    afterHide: function() {
      Application.layout.darkenBackground.hide();
    }
  }
});
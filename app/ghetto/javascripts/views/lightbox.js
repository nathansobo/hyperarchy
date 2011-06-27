_.constructor("Views.Lightboxes.Lightbox", View.Template, {
  content: function() { with(this.builder) {
    div({id: template.id, 'class': "lightbox floatingCard dropShadow", style: "display: none;"}, function() {
      div({'class': "rightCancelX"}).click('hide');
      template.lightboxContent();
    });
  }},

  viewProperties: {
    beforeShow: function() {
      $(window).scrollTop(0);
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
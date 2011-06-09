_.constructor("Views.Lightbox", View.Template, {
  content: function() { with(this.builder) {
    div({id: template.id, 'class': "lightbox"}, function() {
      div({'class': "CancelX"}).click('close');
      template.lightboxContent();
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.lightboxes.children().hide();
      Application.darkenedBackground.addClass('visible');
      Application.darkenedBackground.one('click', this.hitch('close'));
    },

    close: function() {
      this.hide();
    },

    afterHide: function() {
      Application.darkenedBackground.removeClass('visible');
    }
  }
});

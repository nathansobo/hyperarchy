_.constructor("Views.Lightbox", View.Template, {
  content: function() { with(this.builder) {
    div({id: template.id, 'class': "lightbox"}, function() {
      div({'class': "CancelX"}).click('close');
      template.lightboxContent();
    });
  }},

  viewProperties: {

    afterShow: function() {
      Application.darkenedBackground.addClass('visible');
      Application.darkenedBackground.one('click', this.hitch('close'));
    },

    close: function() {
      this.hide();
      Application.darkenedBackground.removeClass('visible');
    }
  }
});

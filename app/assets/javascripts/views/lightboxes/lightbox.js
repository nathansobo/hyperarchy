_.constructor("Views.Lightboxes.Lightbox", View.Template, {
  content: function() { with(this.builder) {
    div({id: template.id, 'class': "lightbox"}, function() {
      template.lightboxContent();
    });
  }},

  viewProperties: {
    beforeShow: function() {
      Application.lightboxes.children().hide();
      Application.darkenedBackground.addClass('visible');
      Application.darkenedBackground.one('click', this.hitch('close'));
    },

    afterShow: function() {
      this.find('textarea:visible, input:visible').eq(0).focus();
    },

    close: function() {
      this.hide();
    },

    afterHide: function() {
      Application.darkenedBackground.removeClass('visible');
    }
  }
});

//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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

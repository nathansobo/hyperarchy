//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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


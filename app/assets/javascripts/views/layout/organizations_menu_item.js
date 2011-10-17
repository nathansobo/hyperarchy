//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Layout.OrganizationsMenuItem', Monarch.View.Template, {
  content: function() { with(this.builder) {
    li(function() {
      a({'class': "admin link"}, "Admin").ref('adminLink').click(function() {
        History.pushState(null, null, this.organization.settingsUrl());
        $(window).click();
        return false;
      });
      a().ref('name');
    }).click(function() {
      History.pushState(null, null, this.organization.url());
    });
  }},

  viewProperties: {
    initialize: function() {
      this.name.bindText(this.organization, 'name');
      this.showOrHideAdminLink();
      var membership = this.organization.membershipForCurrentUser();
      if (membership) this.registerInterest(membership, 'onUpdate', this.hitch('showOrHideAdminLink'));
    },

    showOrHideAdminLink: function() {
      if (this.organization.currentUserCanEdit()) {
        this.adminLink.show();
      } else {
        this.adminLink.hide();
      }
    }
  }
});

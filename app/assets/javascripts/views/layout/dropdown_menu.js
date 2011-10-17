//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Layout.DropdownMenu', View.Template, {
  content: function(params) { with(this.builder) {
    div({'class': "dropdown-menu"}, function() {
      a(template.bind(params.linkContent)).ref('link').click("showMenu");
      ul(template.bind(params.menuContent)).ref("menu");
    });
  }},

  viewProperties: {
    showMenu: function() {
      if (this.menu.is(':visible')) return;

      this.menu.show();
      this.addClass('active');
      this.defer(function() {
        $(window).one('click', this.hitch('hideMenu'));
      });
    },

    hideMenu: function() {
      this.menu.hide();
      this.removeClass('active');
    }
  }
});


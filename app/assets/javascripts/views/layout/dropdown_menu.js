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
      this.defer(function() {
        $(window).one('click', this.hitch('hideMenu'));
      });
    },

    hideMenu: function() {
      this.menu.hide();
    }
  }
});


_.constructor('Views.Layout.LoginForm', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div();
  }},

  viewProperties: {
    afterShow: function() {
      Application.darkenedBackground.addClass('visible');
    }
  }
});
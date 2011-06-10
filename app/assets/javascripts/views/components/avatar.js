_.constructor("Views.Components.Avatar", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "avatar"});
  }},

  viewProperties: {
    initialize: function() {
      this.css('height', this.size);
      this.css('width', this.size);
    },

    user: {
      change: function(user) {
        this.removeClass("validGravatar");
        this.empty();
        this.img = $(new Image());
        this.img
          .load(this.hitch('imageLoaded'))
          .attr('src', user.gravatarUrl(this.size));
      }
    },

    imageLoaded: function() {
      this.addClass("valid-gravatar")
      this.append(this.img);
    }
  }
});
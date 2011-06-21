_.constructor("Views.Components.Avatar", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "avatar"});
  }},

  viewProperties: {
    initialize: function() {
      if (!this.imageSize) throw new Error("No image size");
      this.css('height', this.imageSize);
      this.css('width', this.imageSize);
    },

    user: {
      change: function(user) {
        this.removeClass("valid-gravatar");
        this.empty();
        this.img = $(new Image());
        this.img
          .load(this.hitch('imageLoaded'))
          .attr('src', user.gravatarUrl(this.imageSize));
      }
    },

    imageLoaded: function() {
      this.addClass("valid-gravatar")
      this.append(this.img);
    }
  }
});
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
        this.removeClass("valid-avatar");
        this.empty();
        this.img = $(new Image());
        this.img.height(this.imageSize);
        this.img.width(this.imageSize);

        user.fetchAvatarUrl(this.imageSize)
          .success(function(avatarUrl) {
            this.img
              .attr('src', avatarUrl)
              .load(this.hitch('imageLoaded'));
          }, this);
      }
    },

    imageLoaded: function() {
      this.addClass("valid-avatar")
      this.append(this.img);
    }
  }
});
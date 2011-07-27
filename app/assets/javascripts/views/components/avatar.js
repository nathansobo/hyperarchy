_.constructor("Views.Components.Avatar", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "avatar"}, function() {
      img({'src': '/images/logo_50.png'}).ref('placeholder');
      img().ref('img');
    });
  }},

  viewProperties: {
    initialize: function() {
      if (!this.imageSize) throw new Error("No image size");
      this.css('height', this.imageSize);
      this.css('width', this.imageSize);
      this.img.height(this.imageSize);
      this.img.width(this.imageSize);
      this.placeholder.height(this.imageSize);
      this.placeholder.width(this.imageSize);
      this.showPlaceholder();
    },

    user: {
      change: function(user) {
        this.showPlaceholder();
        user.fetchAvatarUrl(this.imageSize)
          .success(function(avatarUrl) {
            this.img
              .attr('src', avatarUrl)
              .load(this.hitch('showImage'));
          }, this);
      }
    },

    showImage: function() {
      this.placeholder.hide();
      this.img.show();
    },

    showPlaceholder: function() {
      this.img.hide();
      this.placeholder.show();
    }
  }
});
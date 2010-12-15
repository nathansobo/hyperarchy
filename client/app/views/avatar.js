_.constructor("Views.Avatar", View.Template, {
  content: function() { with(this.builder) {
    div({'class': "avatar"});
  }},

  viewProperties: {
    initialize: function() {
    this.css('height', this.size);
    this.css('width', this.size);
    },

    user: {
      afterChange: function(user) {
        this.removeClass("validGravatar");
        this.empty();
        var img = new Image();
        $(img)
          .load(this.hitch('imageLoaded', img))
          .error(this.hitch('imageFailed'))
          .attr('src', user.gravatarUrl(this.size));
      }
    },

    imageLoaded: function(img) {
      this.addClass("validGravatar")
      this.append(img);
    },

    imageFailed: function() {
      if (!this.user().isCurrent()) return;
      this.attr('title', "Click here to set up your avatar at gravatar.com");
      this.css('cursor', "pointer");
      this.simpletooltip();
      this.click(function(event) {
        window.open("http://gravatar.com", "Gravatar");
        event.stopPropagation();
      });
    }
  }
});
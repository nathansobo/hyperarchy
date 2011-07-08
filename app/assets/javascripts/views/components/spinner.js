_.constructor('Views.Components.Spinner', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({'class': "spinner"}, function() {
      _.times(8, function(i) {
        div({'class': "spoke spoke-" + i}, function() {
          div({'class': "solid"});
        });
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.degrees = 0;
      this.show();
    },

    beforeShow: function() {
      this.stop = _.repeat(this.rotate, this, 100);
    },

    afterHide: function() {
      this.stop();
    },

    rotate: function() {
      this.degrees += 45;
      if (this.degrees === 360) this.degrees = 0;
      this.css('-webkit-transform', 'rotate(' + this.degrees + 'deg)');
      this.css('-moz-transform', 'rotate(' + this.degrees + 'deg)');
      this.css('transform', 'rotate(' + this.degrees + 'deg)');
    }
  }
});

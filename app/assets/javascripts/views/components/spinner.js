//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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

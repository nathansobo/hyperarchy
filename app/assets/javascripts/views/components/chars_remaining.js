//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Components.CharsRemaining', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({class: 'chars-remaining'});
  }},

  viewProperties: {
    field: {
      change: function(field) {
        this.updateContent();
        field.bind('keyup paste cut', this.hitch('updateContent'));
        field.focus(this.hitch('active', true));
        field.blur(this.hitch('active', false));
      }
    },

    active: {
      change: function(active) {
        if (active) {
          this.addClass('active');
        } else {
          this.removeClass('active');
        }
      }
    },

    updateContent: function() {
      var remaining = this.limit - this.field().val().length;
      this.text(remaining);

      this.removeClass('warning critical');
      if (remaining < 10) {
        this.addClass('critical');
      } else if (remaining < 20) {
        this.addClass('warning');
      }
    }
  }
});

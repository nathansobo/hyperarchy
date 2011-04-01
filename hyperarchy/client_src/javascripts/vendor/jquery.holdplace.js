(function($) {
  $.fn.rawVal = $.fn.val;

  $.fn.val = function() {
    if (!this.data('holdPlace')) return this.rawVal.apply(this, arguments);
    var holdPlace = this.data('holdPlace');

    if (arguments.length === 0) {
      if (holdPlace.held) {
        return ""
      } else {
        return this.rawVal();
      }
    } else {
      var val = arguments[0];
      if (val === "") {
        this.rawVal(val);
        holdPlace.hold();
      } else {
        holdPlace.release();
        this.rawVal(val);
      }
    }
  };

  $.fn.holdPlace = function(force) {
    if (!force && !!("placeholder" in $('<input>')[0])) return;
    this.each(function() {
      var elt = $(this);

      var holdPlace = {
        hold: function() {
          if (elt.rawVal() !== "") return;
          elt.rawVal(elt.attr('placeholder'));
          elt.addClass("placeHeld");
          elt.data("holdPlace").held = true;
        },

        release: function() {
          if (!elt.data('holdPlace').held) return;
          elt.rawVal("");
          elt.removeClass("placeHeld");
          elt.data("holdPlace").held = false;
        }
      };

      elt.data("holdPlace", holdPlace);
      elt.focus(holdPlace.release);
      elt.blur(holdPlace.hold);
      holdPlace.hold();
    });
  };

})(jQuery);
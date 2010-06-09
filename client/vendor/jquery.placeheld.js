// PlaceHeld jQuery plugin by [Max Wheeler](max@makenosound.com)
// 
// Copyright (c) 2010 Max Wheeler. Licensed under the [WTFPL](http://sam.zoy.org/wtfpl/)
// Dependencies: jQuery
//
// Changelog:
// * v1.0.0 (2010-04-21) Initial Version
// * v1.0.1 (2010-04-29) Minified using YUI compressor instead ofo JSMin
// * v1.0.2 (2010-05-10) Removed default text from form submission; moved placeholder support check outside for() loop
// * v1.0.3 (2010-05-14) Added check for "placheld" class before clearing default text on form submission

(function($){
  $.placeHeld = function(el, options){
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data("placeHeld", base);
    base.placeholderText = base.$el.attr("placeholder");
    
    base.init = function(){
      base.options = $.extend({},$.placeHeld.defaultOptions, options);
      base.$el.bind('blur', base.holdPlace).bind('focus', base.releasePlace).trigger('blur');
      base.$el.parents('form').bind('submit', base.clearPlace);
    };
    // Hold with the default value attribute
    base.holdPlace = function() {
      var value = base.$el.val();
      if (!value) base.$el.val(base.placeholderText).addClass(base.options.className);
    };
    // Refill with the default value attribute
    base.releasePlace = function() {
      var value = base.$el.val();
      if (value == base.placeholderText) base.$el.val('').removeClass(base.options.className);
    };
    // Refill with the default value attribute
    base.clearPlace = function() {
      var value = base.$el.val();
      if (value == base.placeholderText && base.$el.hasClass(base.options.className)) base.$el.val('');
    };
    base.init();
  };
  
  $.placeHeld.defaultOptions = { className: "placeheld" };
  
  $.fn.placeHeld = function(options) {

	// Check for placeholder attribute support
	if (!!("placeholder" in $('<input>')[0])) return;
	
    return this.each(function() {
      (new $.placeHeld(this, options));
    });
  };
})(jQuery);
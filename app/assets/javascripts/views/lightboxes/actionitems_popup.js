//= require ./lightbox

_.constructor('Views.Lightboxes.ActionitemsPopup', Views.Lightboxes.Lightbox, {
  id: "actionitems-popup",

  lightboxContent: function() { with(this.builder) {
    h1(function() {
      raw(("Using Hyperarchy for meetings? Please switch to our new product, <em>Action Items.</em>"))
    });
    div("Action Items is designed for meetings, and we'll be building all features for private teams there. We've already transferred your accounts and data.");

    a({'class': "button", href: "https://actionitems.us"}, "Switch to Action Items").click(function() {
      window.location = "https://actionitems.us";
      return false;
    });
  }}
});

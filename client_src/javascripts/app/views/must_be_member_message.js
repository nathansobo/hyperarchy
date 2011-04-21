_.constructor("Views.MustBeMemberMessage", Views.Lightbox, {
  lightboxContent: function() { with(this.builder) {
    h1("Sorry, you must be a member this organization to do that.");
    div("This organization is configured as read-only by the public. If you want to participate, please contact its owner and ask them to invite you.")
  }},

  id: 'mustBeMemberMessage',

  viewProperties: {
  }
});
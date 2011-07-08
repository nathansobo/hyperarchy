_.constructor('Views.Lightboxes.FeedbackForm', Views.Lightboxes.Lightbox, {
  id: "feedback-form",

  lightboxContent: function() { with(this.builder) {
    form(function() {
      div({id: "feedback-explanation"}, function() {
        text("Thanks for taking the time to talk to us! Feel free to get in touch with us via email at ");
        a({href: "mailto:admin@hyperarchy.com", 'class': "link"}, "admin@hyperarchy.com");
      });
      textarea().ref('textarea').bind('keyup paste cut', 'enableOrDisableSubmitButton');
      input({type: "submit", value: "Send Feedback", 'class': "button"}).ref('submitButton');
    }).submit("sendFeedback");
  }},

  viewProperties: {

    beforeShow: function($super) {
      $super();
      this.textarea.val("");
    },

    sendFeedback: function() {
      $.post("/feedback", { feedback: this.textarea.val() }).success(this.hitch('hide'));
      return false;
    },

    enableOrDisableSubmitButton: function() {
      this.submitButton.attr('disabled', $.trim(this.textarea.val()) === '');
    }
  }
});
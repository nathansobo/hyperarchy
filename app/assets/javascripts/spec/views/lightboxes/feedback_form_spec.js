//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("Views.Lightboxes.FeedbackForm", function() {
  var feedbackForm;

  beforeEach(function() {
    renderLayout();
    feedbackForm = Application.feedbackForm.show();
  });

  describe("when the form is submitted", function() {
    it("submits the contents of the textarea to the feedback url and hides the form when done", function() {
      feedbackForm.textarea.val("I am in love with this site, bros.");
      feedbackForm.find('form').submit();
      expect($.ajax).toHaveBeenCalled();
      expect(mostRecentAjaxRequest.url).toBe("/feedback");
      expect(mostRecentAjaxRequest.data.feedback).toBe("I am in love with this site, bros.");

      mostRecentAjaxDeferred.resolve();

      expect(feedbackForm).toBeHidden();
    });
  });

  describe("enabling and disabling of the submit button", function() {
    it("disables the submit button when the textarea is blank", function() {
      feedbackForm.textarea.val("");
      feedbackForm.textarea.keyup();
      expect(feedbackForm.submitButton).toMatchSelector(':disabled');
      feedbackForm.textarea.val("Rippin site, dudes.")
      feedbackForm.textarea.keyup();
      expect(feedbackForm.submitButton).not.toMatchSelector(':disabled');
      feedbackForm.textarea.val("");
      feedbackForm.textarea.keyup();
      expect(feedbackForm.submitButton).toMatchSelector(':disabled');
    });
  });

  describe("when shown", function() {
    it("clears out previous feedback", function() {
      feedbackForm.textarea.val("moo");
      feedbackForm.hide();
      feedbackForm.show();
      expect(feedbackForm.textarea.val()).toBe("");
    });
  });
});


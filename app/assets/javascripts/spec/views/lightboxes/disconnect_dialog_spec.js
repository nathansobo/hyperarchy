//= require spec/spec_helper

describe("Views.Lightboxes.DisconnectDialog", function() {
  var disconnectDialog, darkenedBackground;
  beforeEach(function() {
    renderLayout();
    darkenedBackground = Application.darkenedBackground;
    disconnectDialog = Application.disconnectDialog;
    disconnectDialog.show();

    spyOn(Application, 'reload');
  });

  describe("when the dialog is hidden", function() {
    it("reloads the page", function() {
      disconnectDialog.hide();
      expect(Application.reload).toHaveBeenCalled();
    });
  });

  describe("when the refresh button is clicked", function() {
    it("hides the dialog", function() {
      disconnectDialog.refreshButton.click();
      expect(disconnectDialog).toBeHidden();
    });
  });
});


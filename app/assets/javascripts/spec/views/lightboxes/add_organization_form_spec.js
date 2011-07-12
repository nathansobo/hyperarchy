//= require spec/spec_helper

describe("Views.Lightboxes.AddOrganizationForm", function() {
  var addOrganizationForm;
  beforeEach(function() {
    renderLayout();
    addOrganizationForm = Application.addOrganizationForm.show();
  });

  describe("when the form is submitted", function() {
    it("creates an organization, hides the form, and navigates to the organization's page", function() {
      useFakeServer();
      spyOn(Application, 'showPage');

      addOrganizationForm.name.val("facebook users");
      addOrganizationForm.createButton.click();

      expect(Server.creates.length).toBe(1);
      var organization = Server.lastCreate.record;
      Server.lastCreate.simulateSuccess();

      expect(addOrganizationForm).toBeHidden();
      expect(Path.routes.current).toBe(organization.url());
    });
  });
});
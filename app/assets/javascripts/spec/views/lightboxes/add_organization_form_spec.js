//= require spec/spec_helper

describe("Views.Lightboxes.AddOrganizationForm", function() {
  var addOrganizationForm;
  beforeEach(function() {
    renderLayout();
    addOrganizationForm = Application.addOrganizationForm.show();

    enableAjax();
    login();

  });

  describe("when the form is submitted", function() {
    it("creates an organization, then fetches the current user's membership, hides the form, and navigates to the organization's page", function() {
      spyOn(Application, 'showPage');

      addOrganizationForm.name.val("Facebook Users");

      waitsFor("organization to be created", function(complete) {
        addOrganizationForm.form.trigger('submit', complete);
      });

      runs(function() {
        expect(addOrganizationForm).toBeVisible();
        expect(Path.routes.current).toBe("/initial_url");
      });

      var organization;
      waitsFor("membership of current user to be fetched", function() {
        organization = Organization.find({name: "Facebook Users"});
        return organization.membershipForCurrentUser();
      });

      runs(function() {
        expect(addOrganizationForm).toBeHidden();
        expect(Path.routes.current).toBe(organization.url());

        expect(mpq.length).toBeGreaterThan(0);
        var event = _.select(mpq, function(event) { return event[0] === 'track'; })[0];
        expect(event).toBeTruthy();
        expect(event[0]).toBe('track');
        expect(event[1]).toBe('Create Organization');
      });
    });
  });
});
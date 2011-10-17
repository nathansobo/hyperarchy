//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

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
      mpq = [];
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

        expectMixpanelAction('track', 'Create Organization');
      });
    });
  });
});

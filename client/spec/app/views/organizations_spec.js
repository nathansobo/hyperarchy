//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Organizations", function() {
    useRemoteFixtures();

    var view;
    before(function() {
      view = Views.Organizations.toView();
    });

    describe("#initialize", function() {
      init(function() {
        Server.auto = false;
      });

      it("fetches the Organizations and populates the organizationSelect with them", function() {
        expect(Server.fetches.length).to(equal, 1);
        Server.fetches.shift().simulateSuccess();

        expect(Organization.empty()).to(beFalse);

        Organization.each(function(organization) {
          expect(view.organizationSelect.find("option:contains('" + organization.name() + "')")).toNot(beEmpty);
        });
      });
    });
  });
}});

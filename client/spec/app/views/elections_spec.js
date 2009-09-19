//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Elections", function() {
    use_remote_fixtures();

    var view;
    before(function() {
      view = Views.Elections.to_view();
    });

    describe("#initialize", function() {
      it("fetches the Organizations and populates the organization_select with them", function() {
        expect(Origin.fetches.length).to(equal, 1);
        Origin.fetches.shift().simulate_success();

        expect(Organization.is_empty()).to(be_false);

        Organization.each(function(organization) {
          expect(view.organization_select.find("option:contains('" + organization.name() + "')")).to_not(be_empty);
        });
      });
    });
  });
}});

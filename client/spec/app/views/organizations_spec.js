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

      it("fetches the organizations and populates the selector with them", function() {
        expect(Server.fetches.length).to(eq, 1);
        expect(Server.lastFetch.relations).to(equal, [Organization.table]);
        Server.lastFetch.simulateSuccess();
        
        Organization.each(function(organization) {
          expect(view.organizationSelect.find("option:contains('" + organization.name() + "')")).toNot(beEmpty);
        });
      });
    });

    describe("#navigate(organizationId)", function() {
      context("when the organizations have not finished loading", function() {
        init(function() {
          Server.auto = false;
        });

        it("retries the call once the organizations have finished loading", function() {
          expect(Organization.empty()).to(beTrue);
          view.navigate(null);

          mock(view, 'navigate');
          Server.lastFetch.simulateSuccess();
          expect(view.navigate).to(haveBeenCalled, withArgs(null));
        });
      });

      context("when the organizations have finished loading", function() {
        before(function() {
          expect(Organization.empty()).to(beFalse);
        });

        context("when called with null", function() {
          it("calls History.load with the path to the first organization", function() {
            view.navigate(null);
            expect(History.path).to(eq, "organizations/" + Organization.first().id());
          });
        });

        context("when called with an organization id", function() {
          it("selects the organization in the selector and displays its elections", function() {
            mock(History, 'load');
            view.navigate("restaurant");
            expect(view.organizationSelect.val()).to(eq, "restaurant");
            expect(view.electionsView.elections()).to(eq, Organization.find("restaurant").elections());
            expect(History.load).toNot(haveBeenCalled);
          });
        });

        context("when called with an organization id and an election id", function() {
          it("calls #navigate on elections with the election id", function() {
            mock(view.electionsView, 'navigate');

            view.navigate("restaurant/elections/menu");
            expect(view.organizationSelect.val()).to(eq, "restaurant");
            expect(view.electionsView.elections()).to(eq, Organization.find("restaurant").elections());
            expect(view.electionsView.navigate).to(haveBeenCalled, withArgs('menu'));
          });
        });
      });
    });

    describe("when the organiation select is changed", function() {
      it("calls History.load with the path to the selected organization", function() {
        view.organizationSelect.val("restaurant");
        view.organizationSelect.change();
        expect(History.path).to(eq, "organizations/restaurant");
      });
    });
  });
}});

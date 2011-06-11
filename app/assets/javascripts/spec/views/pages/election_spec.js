//= require spec/spec_helper

describe("Views.Pages.Election", function() {
  var electionPage;
  beforeEach(function() {
    attachLayout();
    electionPage = Views.Pages.Election.toView();
  });

  describe("when the id is assigned", function() {
    describe("when the election exists in the local repository", function() {
      it("assigns the election", function() {
        stubAjax();
        var election1 = Election.createFromRemote({id: 1});
        electionPage.id(election1.id());
        expect(electionPage.election()).toBe(election1);
      });
    });

    describe("when the election does not exist in the local repository but does exist on the server", function() {
      var election;

      beforeEach(function() {
        clearServerTables();
        login();
        usingBackdoor(function() {
          election = Organization.findSocial().elections().create()
        });
        election.remotelyDestroyed();
      });

      it("fetches the election and assigns it", function() {
        waitsFor("election to be fetched", function(complete) {
          electionPage.id(election.id()).success(complete);
        });

        runs(function() {
          expect(Election.find(election.id())).toEqual(election);
          expect(electionPage.election()).toEqual(election);
        });
      });
    });

    describe("when the election does not exist in the local repository but does not exist on the server", function() {
      var user;
      beforeEach(function() {
        clearServerTables();
        user = login();
      });

      it("navigates to the user's default organization", function() {
        waitsFor("server to return from fetch with nothing", function(complete) {
          electionPage.id(100).invalid(complete);
        });
        runs(function() {
          expect(Path.routes.current).toBe(user.defaultOrganization().url());
        });
      });
    });
  });

  describe("when the election is assigned", function() {
    it("assigns the election id", function() {
      var election = Election.createFromRemote({id: 1});
      electionPage.election(election);
      expect(electionPage.id()).toBe(election.id());
    });
  });
});

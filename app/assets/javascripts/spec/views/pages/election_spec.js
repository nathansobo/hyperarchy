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
        var election1 = Election.createFromRemote({id: 1});
        electionPage.id(election1.id());
        expect(electionPage.election()).toBe(election1);
      });
    });

    describe("when the election does not exist in the local repository but does exist on the server", function() {
      var election;

      beforeEach(function() {
        enableAjax();
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
        enableAjax();
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
    var election;

    beforeEach(function() {
      election = Election.createFromRemote({id: 1, body: 'What would jesus & <mary> do?'});
      electionPage.election(election);
    });

    it("assigns the election id", function() {
      expect(electionPage.id()).toBe(election.id());
    });

    it("assigns the election's body and keeps it up to date when it changes", function() {
      expect(electionPage.body.text()).toEqual(election.body());
      election.remotelyUpdated({body: "what would satan & <damien> do?"});
      expect(electionPage.body.text()).toEqual(election.body());

      var election2 = Election.createFromRemote({id: 2, body: 'Are you my mother?'});
      electionPage.election(election2);
      expect(electionPage.body.text()).toEqual(election2.body());

      election.remotelyUpdated({body: "what would you do for a klondike bar?"});
      expect(electionPage.body.text()).toEqual(election2.body());
    });

    it("assigns the election id on the currentConsensus subview", function() {
      expect(electionPage.currentConsensus.electionId()).toBe(election.id());
    });
  });
});

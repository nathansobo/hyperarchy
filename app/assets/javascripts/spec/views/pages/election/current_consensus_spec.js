//= require spec/spec_helper

describe("Views.Pages.Election.CurrentConsensus", function() {
  var currentConsensusView, election, candidate1, candidate2, user1;

  beforeEach(function() {
    attachLayout();
    currentConsensusView = Application.electionPage.currentConsensus;
    $('#jasmine_content').append(currentConsensusView);

    election = Election.createFromRemote({id: 1});
    candidate1 = election.candidates().createFromRemote({id: 1, body: "Cheese", position: 1});
    candidate2 = election.candidates().createFromRemote({id: 2, body: "Goats", position: 2});

    user1 = User.createFromRemote({id: 1});
    Application.currentUser(user1);
  });


  describe("with the candidates relation assigned", function() {
    beforeEach(function() {
      currentConsensusView.candidates(election.candidates());
    });

    describe("when the selectedCandidate is changed", function() {
      it("adds the .selected class on the selected candidate's li and removes it from any others", function() {
        currentConsensusView.selectedCandidate(candidate1);
        expect(currentConsensusView).toContain('li.selected:contains("' + candidate1.body() + '")');

        currentConsensusView.selectedCandidate(candidate2);

        expect(currentConsensusView).toContain('li.selected:contains("' + candidate2.body() + '")');
        expect(currentConsensusView).not.toContain('li.selected:contains("' + candidate1.body() + '")');

        currentConsensusView.selectedCandidate(null);
        expect(currentConsensusView).not.toContain('li.selected');
      });
    });

    describe("when the position of a candidate changes", function() {
      it("updates the position on the candidate li", function() {
        var candidate1Li = currentConsensusView.find('li:contains("' + candidate1.body() + '")').view();
        var candidate2Li = currentConsensusView.find('li:contains("' + candidate2.body() + '")').view();

        expect(candidate1Li.position.text()).toBe("1");
        expect(candidate2Li.position.text()).toBe("2");

        candidate1.remotelyUpdated({position: 2});
        candidate2.remotelyUpdated({position: 1});

        expect(candidate1Li.position.text()).toBe("2");
        expect(candidate2Li.position.text()).toBe("1");
      });
    });

    describe("when the body of a candidate changes", function()  {
      it("updates the body in the candidate li", function() {
        var candidate1Li = currentConsensusView.find('li:contains("' + candidate1.body() + '")').view();

        expect(candidate1Li.body.text()).toBe("Cheese");

        candidate1.remotelyUpdated({body: 'rockets!'});

        expect(candidate1Li.body.text()).toBe("rockets!");
      });
    });
  });

  describe("icons", function() {
    var user2, candidate3, candidate1Li, candidate2Li, candidate3Li;

    beforeEach(function() {
      candidate3 = election.candidates().createFromRemote({id: 3, body: "Deer", position: 3});
      user2 = User.createFromRemote({id: 2});
      user1.rankingsForElection(election).createFromRemote({candidateId: candidate1.id(), position: 64});
      user1.rankingsForElection(election).createFromRemote({candidateId: candidate2.id(), position: -64});
      user2.rankingsForElection(election).createFromRemote({candidateId: candidate2.id(), position: 64});
      user2.rankingsForElection(election).createFromRemote({candidateId: candidate3.id(), position: -64});

      candidate1.remotelyUpdated({commentCount: 1});
      candidate2.remotelyUpdated({details: "Arcata's full of nimby cryers"});

      currentConsensusView.candidates(election.candidates());
      candidate1Li = currentConsensusView.list.elementForRecord(candidate1);
      candidate2Li = currentConsensusView.list.elementForRecord(candidate2);
      candidate3Li = currentConsensusView.list.elementForRecord(candidate3);
    });

    describe("ranking status of the candidate lis", function() {
      describe("when the candidates relation is assigned", function() {
        it("assigns the ranking statuses of the candidates to reflect the new user's rankings", function() {
          expect(candidate1Li.status).toHaveClass('positive');
          expect(candidate1Li.status).not.toHaveClass('negative');
          expect(candidate2Li.status).not.toHaveClass('positive');
          expect(candidate2Li.status).toHaveClass('negative');
          expect(candidate3Li.status).not.toHaveClass('positive');
          expect(candidate3Li.status).not.toHaveClass('negative');
        });
      });

      describe("when the current user changes", function() {
        it("updates the ranking statuses of the candidates to reflect the new user's rankings", function() {
          Application.currentUser(user2);

          expect(candidate1Li.status).not.toHaveClass('positive');
          expect(candidate1Li.status).not.toHaveClass('negative');
          expect(candidate2Li.status).toHaveClass('positive');
          expect(candidate2Li.status).not.toHaveClass('negative');
          expect(candidate3Li.status).not.toHaveClass('positive');
          expect(candidate3Li.status).toHaveClass('negative');
        });

        it("listens for updates to the new user's rankings", function() {
          Application.currentUser(user2);

          user2.rankings().createFromRemote({candidateId: candidate1.id(), position: -128});
          user2.rankings().find({candidateId: candidate2.id()}).remotelyDestroyed();
          user2.rankings().find({candidateId: candidate3.id()}).remotelyUpdated({position: 128});

          expect(candidate1Li.status).not.toHaveClass('positive');
          expect(candidate1Li.status).toHaveClass('negative');
          expect(candidate2Li.status).not.toHaveClass('positive');
          expect(candidate2Li.status).not.toHaveClass('negative');
          expect(candidate3Li.status).toHaveClass('positive');
          expect(candidate3Li.status).not.toHaveClass('negative');
        });
      });

      describe("when the current user creates, updates or destroys rankings for these candidates", function() {
        it("updates the ranking statuses of the candidates to reflect the new user's rankings", function() {
          user1.rankings().find({candidateId: candidate1.id()}).remotelyUpdated({position: -128});
          user1.rankings().find({candidateId: candidate2.id()}).remotelyDestroyed();
          user1.rankings().createFromRemote({candidateId: candidate3.id(), position: 128});

          expect(candidate1Li.status).not.toHaveClass('positive');
          expect(candidate1Li.status).toHaveClass('negative');
          expect(candidate2Li.status).not.toHaveClass('positive');
          expect(candidate2Li.status).not.toHaveClass('negative');
          expect(candidate3Li.status).toHaveClass('positive');
          expect(candidate3Li.status).not.toHaveClass('negative');
        });
      });

    });

    describe("showing and hiding of the ellipsis", function() {
      describe("when the candidates relation is assigned", function() {
        it("shows the ellipsis for only those candidates that have details or comments", function() {
          expect(candidate1Li.ellipsis).toBeVisible();
          expect(candidate2Li.ellipsis).toBeVisible();
          expect(candidate3Li.ellipsis).not.toBeVisible();
        });
      });

      describe("when candidates' details are updated", function() {
        it("shows the ellipsis for only those candidates that have details or comments", function() {
          candidate2.remotelyUpdated({details: ""});
          candidate3.remotelyUpdated({details: "Deer always die in car accidents."});

          expect(candidate1Li.ellipsis).toBeVisible();
          expect(candidate2Li.ellipsis).not.toBeVisible();
          expect(candidate3Li.ellipsis).toBeVisible();
        });
      });

      describe("when candidate comments are created or removed", function() {
        it("shows the ellipsis for only those candidates that have details or comments", function() {
          candidate1.remotelyUpdated({commentCount: 0});
          candidate3.remotelyUpdated({commentCount: 1});

          expect(candidate1Li.ellipsis).not.toBeVisible();
          expect(candidate2Li.ellipsis).toBeVisible();
          expect(candidate3Li.ellipsis).toBeVisible();
        });
      });
    });
  });

});

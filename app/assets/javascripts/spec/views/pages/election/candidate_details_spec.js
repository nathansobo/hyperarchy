//= require spec/spec_helper

describe("Views.Pages.Election.CandidateDetails", function() {
  var candidateDetails, candidate, creator;

  beforeEach(function() {
    attachLayout();
    candidateDetails = Application.electionPage.candidateDetails;
    creator = User.createFromRemote({id: 999, emailHash: 'blas', firstName: "Mr.", lastName: "Creator"});
    Application.currentUser(creator);
    candidate = creator.candidates().createFromRemote({id: 1, body: "Mustard.", details: "Pardon me. Do you have any Gray Poupon?", createdAt: 1308352736162});

    $('#jasmine_content').html(Application.electionPage);
    Application.electionPage.showCandidateDetails();

    candidateDetails.candidate(candidate);
  });

  describe("when the candidate is assigned", function() {
    it("populates the body, details, and avatar", function() {
      expect(candidateDetails.body.text()).toEqual(candidate.body());
      expect(candidateDetails.details.text()).toEqual(candidate.details());
      candidate.remotelyUpdated({body: "Catsup", details: "37 flavors"});
      expect(candidateDetails.body.text()).toEqual(candidate.body());
      expect(candidateDetails.details.text()).toEqual(candidate.details());
      expect(candidateDetails.avatar.user()).toBe(candidate.creator());
      expect(candidateDetails.creatorName.text()).toBe(creator.fullName());
      expect(candidateDetails.createdAt.text()).toBe(candidate.formattedCreatedAt());
    });

    it("hides the form if it is showing, even if the candidate does not change", function() {
      candidateDetails.candidate(candidate);

      candidateDetails.editLink.click();

      expect(candidateDetails.form).toBeVisible();
      expect(candidateDetails.nonEditableContent).toBeHidden();

      candidateDetails.candidate(candidate);

      expect(candidateDetails.form).toBeHidden();
      expect(candidateDetails.nonEditableContent).toBeVisible();
    });
  });

  describe("showing and hiding of the edit button", function() {
    var currentUserCanEdit;
    beforeEach(function() {
      spyOn(Candidate.prototype, 'editableByCurrentUser').andCallFake(function() {
        return currentUserCanEdit;
      });
      candidateDetails.editLink.hide();
      expect(candidateDetails.editLink).toBeHidden();
    });

    describe("on candidate assignment", function() {
      it("shows the edit link only if the current user can edit", function() {
        var otherCandidate = Candidate.createFromRemote({id: 100, creatorId: creator.id(), createdAt: 234234});

        expect(candidateDetails.editLink).toBeHidden();
        currentUserCanEdit = true;
        candidateDetails.candidate(otherCandidate);
        expect(candidateDetails.editLink).toBeVisible();

        currentUserCanEdit = false;
        candidateDetails.candidate(candidate);
        expect(candidateDetails.editLink).toBeHidden();
      });
    });

    describe("on user switch", function() {
      it("shows the edit button only when the current user is the creator of the candidate, an owner of the organization, or an admin", function() {
        var otherUser = User.createFromRemote({id: 123});

        expect(candidateDetails.editLink).toBeHidden();
        currentUserCanEdit = true;
        Application.currentUser(otherUser);
        expect(candidateDetails.editLink).toBeVisible();

        currentUserCanEdit = false;
        Application.currentUser(creator);
        expect(candidateDetails.editLink).toBeHidden();
      });
    });
  });

  describe("showing and hiding of the edit form", function() {
    it("shows and populates the form fields when edit is clicked and hides them when cancel is clicked", function() {
      expect(candidateDetails.form).toBeHidden();
      expect(candidateDetails.nonEditableContent).toBeVisible();

      candidateDetails.editLink.click();

      expect(candidateDetails.form).toBeVisible();
      expect(candidateDetails.saveLink).toBeVisible();
      expect(candidateDetails.cancelEditLink).toBeVisible();
      expect(candidateDetails.nonEditableContent).toBeHidden();

      expect(candidateDetails.formBody.val()).toBe(candidate.body());
      expect(candidateDetails.formDetails.val()).toBe(candidate.details());

      candidateDetails.cancelEditLink.click();

      expect(candidateDetails.form).toBeHidden();
      expect(candidateDetails.saveLink).toBeHidden();
      expect(candidateDetails.cancelEditLink).toBeHidden();
      expect(candidateDetails.nonEditableContent).toBeVisible();
    });
  });

  describe("when the save is button is clicked", function() {
    var updates;

    beforeEach(function() {
      useFakeServer();
      candidateDetails.editLink.click();
      updates = {
        body: "Relish",
        details: "That green stuff..."
      }

      candidateDetails.formBody.val(updates.body);
      candidateDetails.formDetails.val(updates.details);
    });

    it("updates the record's body and details on the server and hides the form", function() {
      candidateDetails.saveLink.click();
  
      expect(Server.updates.length).toBe(1);

      expect(Server.lastUpdate.dirtyFieldValues).toEqual(updates);
      Server.lastUpdate.simulateSuccess();

      expect(candidateDetails.form).toBeHidden();
      expect(candidateDetails.nonEditableContent).toBeVisible();
      
      expect(candidateDetails.body.text()).toBe(updates.body);
      expect(candidateDetails.details.text()).toBe(updates.details);
    });

    it("wires the form submit event to save", function() {
      candidateDetails.form.submit();
      expect(Server.updates.length).toBe(1);
    });
  });
});

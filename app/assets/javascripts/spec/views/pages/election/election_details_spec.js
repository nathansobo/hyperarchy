//= require spec/spec_helper

describe("Views.Pages.Election.ElectionDetails", function() {
  var election, creator, electionDetails;

  beforeEach(function() {
    creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
    election = creator.elections().createFromRemote({id: 1, body: 'What would jesus & <mary> do?', details: "wlk on wtr.", organizationId: 98, createdAt: 91234});

    attachLayout();

    electionDetails = Application.electionPage.electionDetails;
    $('#jasmine_content').html(electionDetails);
    electionDetails.election(election);
  });

  describe("#election", function() {
    it("assigns the election's body, details and avatar, and keeps the body and details up to date when they change", function() {
      expect(electionDetails.body.text()).toEqual(election.body());
      expect(electionDetails.details.text()).toEqual(election.details());
      election.remotelyUpdated({body: "what would satan & <damien> do?", details: "Isdf"});
      expect(electionDetails.body.text()).toEqual(election.body());
      expect(electionDetails.details.text()).toEqual(election.details());
      expect(electionDetails.avatar.user()).toBe(election.creator());
      expect(electionDetails.creatorName.text()).toBe(election.creator().fullName());
      expect(electionDetails.createdAt.text()).toBe(election.formattedCreatedAt());

      var election2 = Election.createFromRemote({id: 2, body: 'Are you my mother?', details: "I hope so.", createdAt: 2345, creatorId: creator.id()});
      electionDetails.election(election2);
      expect(electionDetails.body.text()).toEqual(election2.body());
      expect(electionDetails.details.text()).toEqual(election2.details());

      election.remotelyUpdated({body: "what would you do for a klondike bar?", details: "jhjyg"});
      expect(electionDetails.body.text()).toEqual(election2.body());
      expect(electionDetails.details.text()).toEqual(election2.details());
    });
  });

  describe("showing and hiding of the edit form", function() {
    it("shows the form when the edit button is clicked and hides it when the cancel button is clicked", function() {
      expect(electionDetails.form).toBeHidden();
      expect(electionDetails.updateLink).toBeHidden();
      expect(electionDetails.cancelEditLink).toBeHidden();

      electionDetails.editLink.click();
      expect(electionDetails.form).toBeVisible();
      expect(electionDetails.cancelEditLink).toBeVisible();
      expect(electionDetails.updateLink).toBeVisible();
      expect(electionDetails.editLink).toBeHidden();
      expect(electionDetails.nonEditableContent).toBeHidden();

      electionDetails.cancelEditLink.click();
      expect(electionDetails.form).toBeHidden();
      expect(electionDetails.cancelEditLink).toBeHidden();
      expect(electionDetails.updateLink).toBeHidden();
      expect(electionDetails.editLink).toBeVisible();
      expect(electionDetails.nonEditableContent).toBeVisible();
    });

    it("hides the form when the election changes", function() {
      electionDetails.form.show();
      electionDetails.updateLink.show();
      electionDetails.cancelEditLink.show();

      var election2 = creator.elections().createFromRemote({id: 2, body: 'MEUAUOEU?!', details: "aonetuhaoeu??!?!!?", organizationId: 98, createdAt: 91234});
      electionDetails.election(election2);

      expect(electionDetails.form).toBeHidden();
      expect(electionDetails.updateLink).toBeHidden();
      expect(electionDetails.cancelEditLink).toBeHidden();
    });
  });

  describe("when the save is button is clicked", function() {
    var updates;

    beforeEach(function() {
      useFakeServer();
      electionDetails.editLink.click();
      updates = {
        body: "Relish",
        details: "That green stuff..."
      }

      electionDetails.formBody.val(updates.body);
      electionDetails.formDetails.val(updates.details);
    });

    it("updates the record's body and details on the server and hides the form", function() {
      electionDetails.updateLink.click();

      expect(Server.updates.length).toBe(1);

      expect(Server.lastUpdate.dirtyFieldValues).toEqual(updates);
      Server.lastUpdate.simulateSuccess();

      expect(electionDetails.form).toBeHidden();
      expect(electionDetails.nonEditableContent).toBeVisible();

      expect(electionDetails.body.text()).toBe(updates.body);
      expect(electionDetails.details.text()).toBe(updates.details);
    });

    it("wires the form submit event to save", function() {
      electionDetails.form.submit();
      expect(Server.updates.length).toBe(1);
    });
  });
});

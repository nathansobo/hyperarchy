//= require spec/spec_helper

describe("Views.Lightboxes.NewElection", function() {
  var newElectionForm, organization;
  beforeEach(function() {
    renderLayout();
    newElectionForm = Application.newElection.show();
    organization = Organization.createFromRemote({id: 1});
    Application.currentOrganizationId(organization.id());
    useFakeServer();
  });

  describe("when the form is submitted", function() {
    describe("when the body field is not blank", function() {
      it("creates an election, hides the form, and navigates to its url", function() {
        spyOn(Application, 'showPage');

        newElectionForm.body.val("What are you doing saturday night?");
        newElectionForm.details.val("I am very lonely.");
        newElectionForm.form.submit();

        expect(Server.creates.length).toBe(1);

        var createdElection = Server.lastCreate.record;
        expect(createdElection.organization()).toBe(organization);
        expect(createdElection.body()).toBe("What are you doing saturday night?");
        expect(createdElection.details()).toBe("I am very lonely.");

        Server.lastCreate.simulateSuccess();

        expect(newElectionForm).toBeHidden();
        expect(Path.routes.current).toBe(createdElection.url());
      });
    });

    describe("when the body field is blank", function() {
      it("does not create an election or hide the form", function() {
        newElectionForm.body.val("    ");
        newElectionForm.form.submit();
        expect(Server.creates.length).toBe(0);
        expect(newElectionForm).toBeVisible();
      });
    });
  });

  describe("when the form is shown after having text typed into it", function() {
    it("clears out the old text", function() {
      newElectionForm.body.val("Junk");
      newElectionForm.details.val("Garbage");
      newElectionForm.close();
      newElectionForm.show();
      expect(newElectionForm.body.val()).toBe("");
      expect(newElectionForm.details.val()).toBe("");
    });
  });

  describe("when enter is pressed in the body textarea", function() {
    it("submits the form", function() {
      newElectionForm.body.val("What's your favorite kinda cheese?");
      newElectionForm.body.trigger({ type : 'keydown', which : 13 });

      expect(Server.creates.length).toBe(1);

    });
  });
});


//= require spec/spec_helper

describe("Views.Pages.Account", function() {
  var currentUser, accountPage;

  beforeEach(function() {
    renderLayout();
    currentUser = User.createFromRemote({id: 1, firstName: "First", lastName: "Last", emailAddress: "email@example.com", emailEnabled: true});
    Application.showPage('account', {userId: 1})
    accountPage = Application.accountPage;
  });

  describe("#params", function() {
    it("assigns the the input fields", function() {
      expect(accountPage.firstName.val()).toBe(currentUser.firstName());
      expect(accountPage.lastName.val()).toBe(currentUser.lastName());
      expect(accountPage.emailAddress.val()).toBe(currentUser.emailAddress());
      expect(accountPage.emailEnabled.attr('checked')).toBe(currentUser.emailEnabled());
    });
  });

  describe("editing and saving of details", function() {
    it("only enables details if the fields are non-empty and differ from the model", function() {
      expect(accountPage.updateButton.attr('disabled')).toBeTruthy();

      accountPage.firstName.val("Newfirst");
      accountPage.firstName.keyup();
      expect(accountPage.updateButton.attr('disabled')).toBeFalsy();

      accountPage.emailAddress.val("");
      accountPage.emailAddress.keyup();
      expect(accountPage.updateButton.attr('disabled')).toBeTruthy();

      accountPage.emailAddress.val(currentUser.remote.emailAddress());
      accountPage.emailAddress.keyup();
      expect(accountPage.updateButton.attr('disabled')).toBeFalsy();

      accountPage.firstName.val(currentUser.remote.firstName());
      accountPage.firstName.keyup();
      expect(accountPage.updateButton.attr('disabled')).toBeTruthy();
    });

    it("updates the record when the form is submitted", function() {
      useFakeServer();

      accountPage.firstName.val("Newfirst");
      accountPage.lastName.val("Newlast");
      accountPage.emailAddress.val("new@example.com");
      accountPage.emailAddress.keyup();

      accountPage.updateButton.click();

      expect(Server.updates.length).toBe(1);
      Server.lastUpdate.simulateSuccess();

      expect(currentUser.firstName()).toBe("Newfirst");
      expect(currentUser.lastName()).toBe("Newlast");
      expect(currentUser.emailAddress()).toBe("new@example.com");
    });
  });

  describe("changing of the emailEnabled checkbox", function() {
    it("updates the model with the new setting", function() {
      useFakeServer();
      expect(accountPage.emailEnabled.attr('checked')).toBeTruthy();

      accountPage.emailEnabled.click();
      expect(Server.updates.length).toBe(1);
      Server.lastUpdate.simulateSuccess();

      expect(currentUser.emailEnabled()).toBeFalsy();

      accountPage.emailEnabled.click();
      expect(Server.updates.length).toBe(1);
      Server.lastUpdate.simulateSuccess();

      expect(currentUser.emailEnabled()).toBeTruthy();
    });
  });
});

//= require spec/spec_helper

describe("Views.Layout", function() {
  beforeEach(function() {
    $('#jasmine_content').html(window.Application = Views.Layout.toView());
    Application.attach();
  });

  describe("#currentUser and #currentUserId", function() {
    it("ensures consistent results regardless of which is used to assign", function() {
      var user1 = User.createFromRemote({id: 1});
      var user2 = User.createFromRemote({id: 2});

      Application.currentUserId(user1.id());
      expect(Application.currentUserId()).toEqual(user1.id());
      expect(Application.currentUser()).toEqual(user1);

      Application.currentUser(user2);
      expect(Application.currentUserId()).toEqual(user2.id());
      expect(Application.currentUser()).toEqual(user2);

      Application.currentUser(user2);
      expect(Application.currentUserId()).toEqual(user2.id());
      expect(Application.currentUser()).toEqual(user2);
    });
  });

  describe("when the user navigates to /organizations/:id", function() {
    it("shows only the organizationPage and assigns the organizationId on it", function() {
      Application.electionPage.show();

      History.pushState(null, null, '/organizations/23');
      expect(Application.electionPage).toBeHidden();
      expect(Application.organizationPage).toBeVisible();
      expect(Application.organizationPage.organizationId()).toBe(23);
    });
  });

  describe("when the user navigates to /elections/:id", function() {
    it("shows only the electionsPage and assigns the organizationId on it", function() {
      History.pushState(null, null, '/organizations/23');
      expect(Application.organizationPage).toBeVisible();
      expect(Application.organizationPage.organizationId()).toBe(23);
    });
  });
});

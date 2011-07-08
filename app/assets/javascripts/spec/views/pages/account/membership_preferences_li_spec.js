//= require spec/spec_helper

describe("Views.Pages.Account.MembershipPreferencesLi", function() {
  var membership, organization, preferencesLi;

  beforeEach(function() {
    organization = Organization.createFromRemote({id: 1, name: "Crazy Eddie's"});
    membership = Membership.createFromRemote({
      id: 1,
      organizationId: organization.id(),
      notifyOfNewQuestions: "daily",
      notifyOfNewCandidates: "weekly",
      notifyOfNewCommentsOnOwnCandidates: "never",
      notifyOfNewCommentsOnRankedCandidates: "immediately"
    });
    preferencesLi = Views.Pages.Account.MembershipPreferencesLi.toView({membership: membership});
  });

  describe("#initialize", function() {
    it("assigns the organization name and all the email preferences", function() {
      expect(preferencesLi.find('h3').text()).toBe("Email Preferences for " + organization.name());
      expect(preferencesLi.find("[name='notifyOfNewQuestions']").val()).toBe(membership.notifyOfNewQuestions());
      expect(preferencesLi.find("[name='notifyOfNewCandidates']").val()).toBe(membership.notifyOfNewCandidates());
      expect(preferencesLi.find("[name='notifyOfNewCommentsOnOwnCandidates']").val()).toBe(membership.notifyOfNewCommentsOnOwnCandidates());
      expect(preferencesLi.find("[name='notifyOfNewCommentsOnRankedCandidates']").val()).toBe(membership.notifyOfNewCommentsOnRankedCandidates());
    });
  });

  describe("when an email preference is changed", function() {
    it("updates the membership record", function() {
      $('#jasmine_content').html(preferencesLi);
      useFakeServer();
      preferencesLi.find("[name='notifyOfNewQuestions']").val("weekly").change();
      expect(Server.updates.length).toBe(1);
      Server.lastUpdate.simulateSuccess();
      expect(membership.notifyOfNewQuestions()).toBe("weekly");
    });
  });
});
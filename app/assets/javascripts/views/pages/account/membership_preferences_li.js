//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Pages.Account.MembershipPreferencesLi', Monarch.View.Template, {
  content: function() { with (this.builder) {
    li(function() {
      h3(function() {
        span("Email Preferences for ");
        span().ref('organizationName');
      });

      div({'class': "email-preference"}, function() {
        label("Email me about new questions: ");
        select({name: "notifyOfNewQuestions"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "every5"}, "Every 5 Minutes");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
      });

      div({'class': "email-preference"}, function() {
        label("Email me about new answers to questions on which I voted: ");
        select({name: "notifyOfNewAnswers"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "every5"}, "Every 5 Minutes");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
      });

      div({'class': "email-preference"}, function() {
        label("Email me about new comments on answers I suggested: ");
        select({name: "notifyOfNewCommentsOnOwnAnswers"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "every5"}, "Every 5 Minutes");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
      });

      div({'class': "email-preference"}, function() {
        label("Email me about new comments on answers I have ranked: ");
        select({name: "notifyOfNewCommentsOnRankedAnswers"}, function() {
          option({value: "immediately"}, "Immediately");
          option({value: "every5"}, "Every 5 Minutes");
          option({value: "hourly"}, "Hourly");
          option({value: "daily"}, "Daily");
          option({value: "weekly"}, "Weekly");
          option({value: "never"}, "Never");
        });
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.organizationName.bindText(this.membership.organization(), 'name');
      this.model(this.membership);
      this.find('select').change(this.hitch('save'));
    }
  }
});

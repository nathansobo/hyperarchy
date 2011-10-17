//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Pages.OrganizationSettings', Monarch.View.Template, {
  content: function() { with(this.builder) {
    div({id: 'organization-settings'}, function() {
      h2("Organization Settings")
      form(function() {
        label({'for': "name"}, "Name");
        input({'name': "name"}).ref('name');
        label({'for': "privacy"}, "Privacy: ");
        select({'name': "privacy"}, function() {
          option({'value': 'public'}, "Public");
          option({'value': 'private'}, "Private");
        }).ref('privacy');
        input({type: "submit", value: "Save", 'class': "update button"}).ref('updateButton');
      }).submit('save');

      div({id: "members"}, function() {
        a({'class': "link"}, "Invite Your Team").ref('inviteLink').click('showInviteBox');
        h2("Members");
        table(function() {
          thead(function() {
            th("Name");
            th("Email Address");
            th("Role");
            th("");
          });
          subview('memberships', Views.Components.SortedList, {
            placeholderTag: "tbody",
            rootTag: "tbody",
            buildElement: function(membership) {
              return Views.Pages.OrganizationSettings.MembershipLi.toView({membership: membership});
            }
          });
        });
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.find('input,select').bind('keyup paste cut change', this.hitch('enableOrDisableUpdateButton'));
    },

    params: {
      change: function(params) {
        return this.organization(Organization.find(params.organizationId));
      }
    },

    organization: {
      change: function(organization) {
        Application.currentOrganization(organization);
        this.model(organization);
        this.enableOrDisableUpdateButton();
        return organization.memberships().joinTo(User).fetch().success(function() {
          this.memberships.relation(organization.memberships().joinTo(User).where({guest: false}).project(Membership));
        }, this);
      }
    },

    enableOrDisableUpdateButton: function() {
      if (this.fieldValuesMatchModel()) {
        this.updateButton.attr('disabled', true);
      } else {
        this.updateButton.attr('disabled', false);
      }
    },

    save: function($super) {
      $super().success(this.hitch('enableOrDisableUpdateButton'));
      return false;
    },

    showInviteBox: function() {
      Application.inviteBox.show();
    }
  }
});

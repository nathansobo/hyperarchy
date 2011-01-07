_.constructor("Views.MembershipTr", View.Template, {
  content: function(params) { with(this.builder) {
    var membership = params.membership;
    tr({'class': "membershipTr"}, function() {
      td(membership.fullName());
      td(membership.emailAddress());
      td({'class': "role"}, function() {
        if (membership.userId() !== Application.currentUserId) {
          select(function() {
            option({selected: membership.role() === "member", value: "member"}, "Member");
            option({selected: membership.role() === "owner", value: "owner"}, "Owner");
          }).change(function(view) {
            view.roleChangePending.removeClass('inactive');
            membership.update({role: this.val()}).onSuccess(function() {
              view.roleChangePending.addClass('inactive');
            });
          });
          div({'class': "loading inactive"}).ref('roleChangePending');
        } else {
          text(_.capitalize(membership.role()));
        }
      });
      td(membership.pending() ? "Pending" : "Accepted");
      td({'class': "remove"}, function() {
        if (membership.user() !== Application.currentUser()) {
          a({href: "#"}, "Remove").click(function(view) {
            view.destroyPending.removeClass('inactive');
            membership.destroy();
            return false;
          });
          div({'class': "loading inactive"}).ref('destroyPending');
        }
      });
    });
  }},

  viewProperties: {
    initialize: function() {
//      this.avatar.user(this.membership.user);
    }
  }
});
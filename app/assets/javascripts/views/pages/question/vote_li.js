//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor('Views.Pages.Question.VoteLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li({'class': "vote"}, function() {
      a(function() {
        subview('avatar', Views.Components.Avatar, {imageSize: 34});
        div({'class': "name"}).ref('name');
        div({'class': "date"}).ref('date');
      }).click(function() {
        History.replaceState(null, null, params.vote.url());
      });
    });
  }},

  viewProperties: {
    initialize: function() {
      this.hide();
      User.findOrFetch(this.vote.userId()).success(function(user) {
        this.name.bindText(user, 'fullName');
        this.date.bindText(this.vote, 'formattedUpdatedAt');
        this.avatar.user(user);
        this.show();
      }, this);
    }
  }
});

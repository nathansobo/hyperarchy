Organization.prototype.makeMember = function(attributes) {
  var user = User.createFromRemote(attributes);
  this.memberships().createFromRemote({id: Membership.size() + 1, userId: user.id()});
  return user;
};
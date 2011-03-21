module ModelSpecMethods
  def set_current_user(user)
    Prequel.session.current_user = user
  end

  def current_user
    Prequel.session.current_user
  end

  def make_member(organization, attributes = {})
    user = User.make(attributes)
    organization.memberships.create!(:user => user, :suppress_invite_email => true)
    user
  end

  def make_owner(organization, attributes = {})
    user = User.make(attributes)
    organization.memberships.create!(:user => user, :role => "owner", :suppress_invite_email => true)
    user
  end

  def find_majority(winner, loser)
    election.majorities.find(:winner => winner, :loser => loser).reload
  end
end
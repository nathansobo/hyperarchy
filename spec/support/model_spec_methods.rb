module ModelSpecMethods
  def set_current_user(user)
    Prequel.session.current_user = user
  end

  def current_user
    Prequel.session.current_user
  end

  def find_majority(winner, loser)
    election.majorities.find(:winner => winner, :loser => loser).reload
  end
end
class Ranking < Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float

  belongs_to :user
  belongs_to :candidate
  belongs_to :election

  def rankings_by_same_user
    Ranking.where(:user_id => user_id, :election_id => election_id)
  end

  def higher_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] < position)
  end

  def lower_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] > position)
  end

  def majorities_where_ranked_candidate_is_winner
    Majority.where(:winner_id => candidate_id)
  end

  def majorities_where_ranked_candidate_is_loser
    Majority.where(:loser_id => candidate_id)
  end

  def after_create
    majorities_to_increment =
      majorities_where_ranked_candidate_is_winner.
        left_join(higher_rankings_by_same_user).on(:loser_id => :candidate_id).
        where(:candidate_id => nil).
        project(Majority)

    majorities_to_decrement =
      lower_rankings_by_same_user.
        join(majorities_where_ranked_candidate_is_loser).on(Ranking[:candidate_id] => Majority[:winner_id]).
        project(Majority)

    majorities_to_increment.update(:count => Majority[:count] + 1)
    majorities_to_decrement.update(:count => Majority[:count] - 1)
  end

end
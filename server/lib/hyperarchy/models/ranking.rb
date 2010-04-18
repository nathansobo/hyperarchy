class Ranking < Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float

  belongs_to :user
  belongs_to :candidate
  belongs_to :election

  def after_create
    majorities_where_ranked_candidate_is_winner.
      left_join(higher_rankings_by_same_user).on(:loser_id => :candidate_id).
      where(:candidate_id => nil).
      increment(:count)

    lower_rankings_by_same_user.
      join(majorities_where_ranked_candidate_is_loser).on(:candidate_id => :winner_id).
      decrement(:count)

    election.compute_global_ranking
  end

  def after_update(changeset)
    return unless changeset.changed?(:position)

    old_position = changeset.old_state.position
    new_position = changeset.new_state.position
    if new_position < old_position
      after_ranking_moved_up(new_position, old_position)
    else
      after_ranking_moved_down(new_position, old_position)
    end

    election.compute_global_ranking
  end

  def after_ranking_moved_up(new_position, old_position)
    previously_higher_rankings = lower_rankings_by_same_user.where(Ranking[:position] < old_position)
    previously_higher_rankings.
      join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
      decrement(:count)

    previously_higher_rankings.
      join(majorities_where_ranked_candidate_is_winner).on(:loser_id => :candidate_id).
      increment(:count)
  end

  def after_ranking_moved_down(new_position, old_position)
    previously_lower_rankings = higher_rankings_by_same_user.where(Ranking[:position] > old_position)
    previously_lower_rankings.
      join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
      increment(:count)

    previously_lower_rankings.
      join(majorities_where_ranked_candidate_is_winner).on(:loser_id => :candidate_id).
      decrement(:count)
  end

  def after_destroy
    majorities_where_ranked_candidate_is_winner.
      left_join(higher_rankings_by_same_user).on(:loser_id => :candidate_id).
      where(:candidate_id => nil).
      decrement(:count)

    lower_rankings_by_same_user.
      join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
      increment(:count)

    if all_rankings_for_same_candidate.empty?
      candidate.update(:position => nil)
    end

    election.compute_global_ranking
  end

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

  def all_rankings_for_same_candidate
    Ranking.where(:candidate_id => candidate_id)
  end
end
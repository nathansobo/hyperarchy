class Ranking < Monarch::Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float

  belongs_to :user
  belongs_to :candidate
  belongs_to :election

  def after_create
    if position > 0
      increment_victories_over(lower_positive_rankings_by_same_user)
      decrement_defeats_by(lower_positive_rankings_by_same_user)
      increment_victories_over(candidates_not_ranked_by_same_user)
    else
      increment_defeats_by(higher_negative_rankings_by_same_user)
      decrement_victories_over(higher_negative_rankings_by_same_user)
      increment_defeats_by(candidates_not_ranked_by_same_user)
    end

    election.compute_global_ranking
  end

  def after_update(changeset)
    return unless changeset.changed?(:position)
    old_position = changeset.old_state.position
    if position > old_position
      after_ranking_moved_up(old_position)
    else
      after_ranking_moved_down(old_position)
    end

    election.compute_global_ranking
  end

  def after_ranking_moved_up(old_position)
    previously_higher_rankings = lower_rankings_by_same_user.where(Ranking[:position] > old_position)

    increment_victories_over(previously_higher_rankings)
    decrement_defeats_by(previously_higher_rankings)

    if position > 0 && old_position < 0
      increment_victories_over(candidates_not_ranked_by_same_user)
      decrement_defeats_by(candidates_not_ranked_by_same_user)
    end
  end

  def after_ranking_moved_down(old_position)
    previously_lower_rankings = higher_rankings_by_same_user.where(Ranking[:position] < old_position)
    decrement_victories_over(previously_lower_rankings)
    increment_defeats_by(previously_lower_rankings)

    if position < 0 && old_position > 0
      decrement_victories_over(candidates_not_ranked_by_same_user)
      increment_defeats_by(candidates_not_ranked_by_same_user)
    end
  end

  def after_destroy
    if position > 0
      decrement_victories_over(lower_positive_rankings_by_same_user)
      increment_defeats_by(lower_positive_rankings_by_same_user)
      decrement_victories_over(candidates_not_ranked_by_same_user)
    else
      increment_victories_over(higher_negative_rankings_by_same_user)
      decrement_defeats_by(higher_negative_rankings_by_same_user)
      decrement_defeats_by(candidates_not_ranked_by_same_user)
    end

    if all_rankings_for_same_candidate.empty?
      candidate.update(:position => nil)
    end

    election.compute_global_ranking
  end

  def increment_victories_over(rankings_or_candidates)
    victories_over(rankings_or_candidates).increment(:count)
  end

  def decrement_victories_over(rankings_or_candidates)
    victories_over(rankings_or_candidates).decrement(:count)
  end

  def increment_defeats_by(rankings_or_candidates)
    defeats_by(rankings_or_candidates).increment(:count)
  end

  def decrement_defeats_by(rankings_or_candidates)
    defeats_by(rankings_or_candidates).decrement(:count)
  end

  def victories_over(rankings_or_candidates)
    majorities_where_ranked_candidate_is_winner.
      join(rankings_or_candidates).on(:loser_id => candidate_id_join_column(rankings_or_candidates))
  end

  def defeats_by(rankings_or_candidates)
    majorities_where_ranked_candidate_is_loser.
      join(rankings_or_candidates).on(:winner_id => candidate_id_join_column(rankings_or_candidates))
  end

  def candidate_id_join_column(rankings_or_candidates)
    rankings_or_candidates.column(:candidate_id) ? :candidate_id : Candidate[:id]
  end

  def rankings_by_same_user
    Ranking.where(:user_id => user_id, :election_id => election_id)
  end

  def higher_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] > position)
  end

  def lower_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] < position)
  end

  def positive_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] > 0)
  end

  def negative_rankings_by_same_user
    rankings_by_same_user.where(Ranking[:position] < 0)
  end 

  def higher_positive_rankings_by_same_user
    positive_rankings_by_same_user.where(Ranking[:position] > position)
  end

  def lower_positive_rankings_by_same_user
    positive_rankings_by_same_user.where(Ranking[:position] < position)
  end

  def higher_negative_rankings_by_same_user
    negative_rankings_by_same_user.where(Ranking[:position] > position)
  end

  def lower_negative_rankings_by_same_user
    negative_rankings_by_same_user.where(Ranking[:position] < position)
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

  def all_candidates_in_election
    Candidate.where(:election_id => election_id)
  end

  def candidates_not_ranked_by_same_user
    all_candidates_in_election.
      left_join_to(rankings_by_same_user).
      where(Ranking[:id] => nil).
      project(Candidate)
  end
end
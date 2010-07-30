class Ranking
  attr_reader :election_id, :default_rank
  
  # the position of this keyword in the ranking array indicates the place
  #  for which all of the unranked candidates are tied.
  UNRANKED_ID = "others"
  
  def initialize(election_id, ranking = [])
    @election_id = election_id
    @ranking = ranking
    if not @ranking.include?(UNRANKED_ID)
      @ranking.push(UNRANKED_ID);  end
    @default_rank = @ranking.index(UNRANKED_ID)
  end
  
  # which candidate(s) are in Nth place?
  def candidates_of_rank(rank)
    @ranking[rank]
  end
  
  # in which place is candidate N?
  def rank_of_candidate(candidate_id)
    @ranking.each_index do |rank|
      return rank  if Array(@ranking[rank]).include?(candidate_id) 
    end
    return default_rank
  end
  
  # which candidates ARE explicity ranked by this user?
  def ranked_candidates
    Array(@ranking - [UNRANKED_ID]).flatten.sort
  end
  
  # which candidates are NOT explicity ranked by this user?
  def unranked_candidates
    num_candidates = Election[@election_id].candidates.length
    all_candidates = (0...num_candidates).to_a
    return all_candidates - @ranking.flatten
  end
  
  # which candidates are ranked above candidate N?
  def candidates_above(candidate_id)
    rank = rank_of_candidate(candidate_id)
    candidates_above = Array(@ranking[0...rank])
    if candidates_above.include?(UNRANKED_ID)
      candidates_above = candidates_above - [UNRANKED_ID] + unranked_candidates;  end
    return candidates_above.flatten.sort
  end 
  
  # which candidates are ranked below candidate N? 
  def candidates_below(candidate_id)
    rank = rank_of_candidate(candidate_id)
    candidates_below = Array(@ranking[rank+1...@ranking.length])
    if candidates_below.include?(UNRANKED_ID)
      candidates_below = candidates_below - [UNRANKED_ID] + unranked_candidates;  end
    return candidates_below.flatten.sort
  end 
  
  # which candidates are ranked above all those that aren't explicity ranked?
  def candidates_above_default
    Array(@ranking[0...@default_rank]).flatten.sort
  end
  
  # which candidates are ranked below all those that aren't explicity ranked?
  def candidates_below_default
    Array(@ranking[@default_rank+1...@ranking.length]).flatten.sort
  end  
end


# class Ranking < Monarch::Model::Record
#   column :user_id, :key
#   column :election_id, :key
#   column :candidate_id, :key
#   column :position, :float
# 
#   belongs_to :user
#   belongs_to :candidate
#   belongs_to :election
# 
#   def after_create
#     majorities_where_ranked_candidate_is_winner.
#       left_join(higher_rankings_by_same_user).on(:loser_id => :candidate_id).
#       where(:candidate_id => nil).
#       increment(:count)
# 
#     lower_rankings_by_same_user.
#       join(majorities_where_ranked_candidate_is_loser).on(:candidate_id => :winner_id).
#       decrement(:count)
# 
#     election.compute_global_ranking
#   end
# 
#   def after_update(changeset)
#     return unless changeset.changed?(:position)
# 
#     old_position = changeset.old_state.position
#     new_position = changeset.new_state.position
#     if new_position < old_position
#       after_ranking_moved_up(new_position, old_position)
#     else
#       after_ranking_moved_down(new_position, old_position)
#     end
# 
#     election.compute_global_ranking
#   end
# 
#   def after_ranking_moved_up(new_position, old_position)
#     previously_higher_rankings = lower_rankings_by_same_user.where(Ranking[:position] < old_position)
#     previously_higher_rankings.
#       join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
#       decrement(:count)
# 
#     previously_higher_rankings.
#       join(majorities_where_ranked_candidate_is_winner).on(:loser_id => :candidate_id).
#       increment(:count)
#   end
# 
#   def after_ranking_moved_down(new_position, old_position)
#     previously_lower_rankings = higher_rankings_by_same_user.where(Ranking[:position] > old_position)
#     previously_lower_rankings.
#       join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
#       increment(:count)
# 
#     previously_lower_rankings.
#       join(majorities_where_ranked_candidate_is_winner).on(:loser_id => :candidate_id).
#       decrement(:count)
#   end
# 
#   def after_destroy
#     majorities_where_ranked_candidate_is_winner.
#       left_join(higher_rankings_by_same_user).on(:loser_id => :candidate_id).
#       where(:candidate_id => nil).
#       decrement(:count)
# 
#     lower_rankings_by_same_user.
#       join(majorities_where_ranked_candidate_is_loser).on(:winner_id => :candidate_id).
#       increment(:count)
# 
#     if all_rankings_for_same_candidate.empty?
#       candidate.update(:position => nil)
#     end
# 
#     election.compute_global_ranking
#   end
# 
#   def rankings_by_same_user
#     Ranking.where(:user_id => user_id, :election_id => election_id)
#   end
# 
#   def higher_rankings_by_same_user
#     rankings_by_same_user.where(Ranking[:position] < position)
#   end
# 
#   def lower_rankings_by_same_user
#     rankings_by_same_user.where(Ranking[:position] > position)
#   end
# 
#   def majorities_where_ranked_candidate_is_winner
#     Majority.where(:winner_id => candidate_id)
#   end
# 
#   def majorities_where_ranked_candidate_is_loser
#     Majority.where(:loser_id => candidate_id)
#   end
# 
#   def all_rankings_for_same_candidate
#     Ranking.where(:candidate_id => candidate_id)
#   end
# end

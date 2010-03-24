class Ranking < Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float

  belongs_to :user
  belongs_to :candidate
  belongs_to :election

  def after_create
    p election.majorities.where(:winner_id => candidate_id).all


    election_candidates = Candidate.where(:election_id => election_id)
    rankings_for_election_by_user = Ranking.where(:user_id => user_id, :election_id => election_id)

    election_candidates.left_join_to(rankings_for_election_by_user)


    election.rankings


    election.majorities.where(:winner_id => candidate_id).update(:count => Majority[:count] + 1)
  end

end
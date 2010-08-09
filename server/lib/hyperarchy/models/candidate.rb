class Candidate < Monarch::Model::Record
  column :body, :string
  column :election_id, :key
  column :position, :integer

  belongs_to :election

  def after_create
    Candidate.where(:election_id => election_id).where(Candidate[:id].neq(id)).each do |other_candidate|
      Majority.create({:winner => self, :loser => other_candidate, :election_id => election_id})
      Majority.create({:winner => other_candidate, :loser => self, :election_id => election_id})
    end

    victories_over(election.negative_candidate_ranking_counts).update(:count => :times_ranked)
    defeats_by(election.positive_candidate_ranking_counts).update(:count => :times_ranked)
  end

  def victories_over(other_candidate_ranking_counts)
    election.
      majorities.
      where(:winner_id => id).
      join(other_candidate_ranking_counts).
        on(:loser_id => :candidate_id)
  end

  def defeats_by(other_candidate_ranking_counts)
    election.
      majorities.
      where(:loser_id => id).
      join(other_candidate_ranking_counts).
        on(:winner_id => :candidate_id)
  end
end
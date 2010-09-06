class Candidate < Monarch::Model::Record
  column :body, :string
  column :election_id, :key
  column :creator_id, :key
  column :position, :integer

  belongs_to :election
  belongs_to :creator, :class_name => "User"

  def before_create
    self.creator ||= current_user
  end

  def after_create
    other_candidates.each do |other_candidate|
      Majority.create({:winner => self, :loser => other_candidate, :election_id => election_id})
      Majority.create({:winner => other_candidate, :loser => self, :election_id => election_id})
    end

    victories_over(election.negative_candidate_ranking_counts).update(:pro_count => :times_ranked)
    victories_over(election.positive_candidate_ranking_counts).update(:con_count => :times_ranked)
    defeats_by(election.positive_candidate_ranking_counts).update(:pro_count => :times_ranked)
    defeats_by(election.negative_candidate_ranking_counts).update(:con_count => :times_ranked)
  end

  def other_candidates
    election.candidates.where(Candidate[:id].neq(id))
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
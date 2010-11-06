class Candidate < Monarch::Model::Record
  column :body, :string
  column :details, :string, :default => ""
  column :election_id, :key
  column :creator_id, :key
  column :position, :integer

  belongs_to :election
  belongs_to :creator, :class_name => "User"
  has_many :rankings

  def organization_ids
    election ? election.organization_ids : []
  end

  def can_create?
    return true unless current_user
    election.organization.has_member?(current_user)
  end

  def can_update?
    return true unless current_user
    current_user.admin? || creator_id == current_user.id || election.organization.has_owner?(current_user)
  end

  def update_whitelist
    [:body, :details]
  end

  def before_create
    election.lock
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

    election.compute_global_ranking
    election.unlock
  end

  def before_destroy
    election.lock
    puts "destroying candidate #{id}"
    rankings.each(&:destroy)
    winning_majorities.each(&:destroy)
    losing_majorities.each(&:destroy)
  end

  def after_destroy
    election.unlock
  end

  def other_candidates
    election.candidates.where(Candidate[:id].neq(id))
  end

  def victories_over(other_candidate_ranking_counts)
    winning_majorities.
      join(other_candidate_ranking_counts).
        on(:loser_id => :candidate_id)
  end

  def defeats_by(other_candidate_ranking_counts)
    losing_majorities.
      join(other_candidate_ranking_counts).
        on(:winner_id => :candidate_id)
  end

  def winning_majorities
    election.majorities.where(:winner_id => id)
  end

  def losing_majorities
    election.majorities.where(:loser_id => id)
  end
end
class Candidate < Monarch::Model::Record
  column :body, :string
  column :details, :string, :default => ""
  column :election_id, :key
  column :creator_id, :key
  column :position, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :election
  belongs_to :creator, :class_name => "User"
  has_many :rankings
  has_many :comments, :class_name => "CandidateComment"

  attr_accessor :suppress_notification_email, :suppress_current_user_membership_check
  delegate :organization, :to => :election

  def organization_ids
    election ? election.organization_ids : []
  end

  def can_create?
    organization.current_user_can_create_items?
  end

  def can_update_or_destroy?
    current_user.admin? || creator_id == current_user.id || election.organization.has_owner?(current_user)
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:body, :details, :election_id]
  end

  def update_whitelist
    [:body, :details]
  end

  def before_create
    organization.ensure_current_user_is_member unless suppress_current_user_membership_check
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

    send_notifications
  end

  def before_destroy
    comments.each(&:destroy)
    election.lock
    rankings.each do |ranking|
      ranking.suppress_vote_update = true
      ranking.destroy
    end
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

  def users_to_notify_immediately
    election.votes.
      join(Membership.where(:organization_id => election.organization_id)).
        on(Vote[:user_id].eq(Membership[:user_id])).
      where(:notify_of_new_candidates => "immediately").
      where(Membership[:user_id].neq(creator_id)).
      join_through(User)
  end

  protected

  def send_notifications
    return if suppress_notification_email
    Hyperarchy.defer { Hyperarchy::Notifier.send_immediate_notifications(self) }
  end
end
class Election < Prequel::Record
  column :id, :integer
  column :organization_id, :integer
  column :creator_id, :integer
  column :body, :string
  column :details, :string
  column :vote_count, :integer, :default => 0
  column :score, :float
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :candidates
  has_many :votes
  has_many :rankings
  has_many :majorities
  has_many :election_visits

  belongs_to :creator, :class_name => "User"
  belongs_to :organization

  attr_accessor :suppress_current_user_membership_check

  include SupportsNotifications

  class << self
    def update_scores
      Prequel::DB.execute(%{
        update elections set score = ((vote_count + #{SCORE_EXTRA_HOURS}) / pow((extract(epoch from (now() - created_at)) / 3600) + 2, 1.8))
      })
    end

    def compute_score(vote_count, age_in_hours)
      (vote_count + SCORE_EXTRA_HOURS) / ((age_in_hours + SCORE_EXTRA_HOURS) ** SCORE_GRAVITY)
    end
  end

  SCORE_EXTRA_VOTES = 1
  SCORE_EXTRA_HOURS = 2
  SCORE_GRAVITY = 1.8
  INITIAL_SCORE = compute_score(0, 0)

  def can_create?
    organization.current_user_can_create_items?
  end

  def can_update_or_destroy?
    current_user.admin? || creator_id == current_user.id || organization.has_owner?(current_user)
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:organization_id, :body]
  end

  def update_whitelist
    [:body, :details]
  end

  def organization_ids
    [organization_id]
  end

  def before_create
    ensure_body_within_limit
    organization.ensure_current_user_is_member unless suppress_current_user_membership_check
    self.creator ||= current_user
    self.score = INITIAL_SCORE
  end

  def ensure_body_within_limit
    raise SecurityError, "Body exceeds 140 characters" if body.length > 140
  end

  def before_update(changeset)
    ensure_body_within_limit if changeset[:body]
    self.score = compute_score if changeset.changed?(:vote_count)
  end

  def after_create
    organization.increment(:election_count)
    send_immediate_notifications
  end

  def users_to_notify_immediately
    organization.memberships.
      where(:notify_of_new_elections => "immediately").
      where(Membership[:user_id].neq(creator_id)).
      join_through(User)
  end

  def before_destroy
    candidates.each(&:destroy)
    election_visits.each(&:destroy)
  end

  def after_destroy
    organization.decrement(:election_count)
  end

  def compute_global_ranking
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:pro_count].desc, Majority[:con_count].asc, Majority[:winner_created_at].asc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |candidate_id, index|
      candidate = candidates.find(candidate_id)
      candidate.update!(:position => index + 1)
    end

    update!(:updated_at => Time.now)
  end

  def positive_rankings
    rankings.where(Ranking[:position].gt(0))
  end

  def negative_rankings
    rankings.where(Ranking[:position].lt(0))
  end

  def positive_candidate_ranking_counts
    times_each_candidate_is_ranked(positive_rankings)
  end

  def negative_candidate_ranking_counts
    times_each_candidate_is_ranked(negative_rankings)
  end

  def times_each_candidate_is_ranked(relation)
    relation.
      group_by(:candidate_id).
      project(:candidate_id, Ranking[:id].count.as(:times_ranked))
  end

  def ranked_candidates
    candidates.
      join(rankings).
      project(Candidate)
  end

  def compute_score
    self.class.compute_score(vote_count, age_in_hours)
  end

  def age_in_hours
    (Time.now.to_i - created_at.to_i) / 3600
  end
end

class Election < Monarch::Model::Record
  column :organization_id, :key
  column :creator_id, :key
  column :body, :string
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

  attr_accessor :suppress_notification_email

  class << self
    def update_scores
      Origin.connection.execute(%{
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
    current_user.admin? || organization.has_member?(current_user)
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
    [:body]
  end

  def organization_ids
    [organization_id]
  end

  def before_create
    self.creator ||= current_user
    self.score = INITIAL_SCORE
  end

  def before_update(changeset)
    self.score = compute_score if changeset[:vote_count]
  end

  def after_create
    unless suppress_notification_email
      Hyperarchy.defer { Hyperarchy::Notifier.send_immediate_notifications(self) }
    end
    organization.increment(:election_count)
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
    rankings.where(Ranking[:position] > 0)
  end

  def negative_rankings
    rankings.where(Ranking[:position] < 0)
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
      join_to(rankings).
      project(Candidate)
  end

  def compute_score
    self.class.compute_score(vote_count, age_in_hours)
  end

  def age_in_hours
    (Time.now.to_i - created_at.to_i) / 3600
  end

  def full_url
    "https://#{HTTP_HOST}/app#view=election&electionId=#{id}"
  end
end

class Membership < Prequel::Record
  column :id, :integer
  column :organization_id, :integer
  column :user_id, :integer
  column :role, :string, :default => "member"
  column :last_visited, :datetime
  column :notify_of_new_elections, :string, :default => "daily"
  column :notify_of_new_candidates, :string, :default => "daily"
  column :notify_of_new_comments_on_own_candidates, :string, :default => "daily"
  column :notify_of_new_comments_on_ranked_candidates, :string, :default => "daily"
  column :created_at, :datetime
  column :updated_at, :datetime

  synthetic_column :first_name, :string
  synthetic_column :last_name, :string
  synthetic_column :email_address, :string

  belongs_to :organization
  belongs_to :user

  attr_writer :email_address, :first_name, :last_name
  delegate :email_address, :first_name, :last_name, :to => :user

  def current_user_is_admin_or_organization_owner?
    current_user.admin? || organization.has_owner?(current_user)
  end
  alias can_create? current_user_is_admin_or_organization_owner?
  alias can_destroy? current_user_is_admin_or_organization_owner?

  def can_update?
    current_user_is_admin_or_organization_owner? || user == current_user
  end

  def create_whitelist
    [:organization_id, :user_id, :role, :first_name, :last_name, :email_address,
     :notify_of_new_elections, :notify_of_new_candidates,
     :notify_of_new_comments_on_ranked_candidates,
     :notify_of_new_comments_on_own_candidates]
  end

  def update_whitelist
    if current_user_is_admin_or_organization_owner?
      [:first_name, :last_name, :role, :last_visited,
       :notify_of_new_elections, :notify_of_new_candidates,
       :notify_of_new_comments_on_ranked_candidates,
       :notify_of_new_comments_on_own_candidates]
    else
      [:last_visited, :notify_of_new_elections, :notify_of_new_candidates,
       :notify_of_new_comments_on_ranked_candidates,
       :notify_of_new_comments_on_own_candidates]
    end
  end

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    if current_user_can_read_email_address?
      super
    else
      [:email_address]
    end
  end

  def current_user_can_read_email_address?
    return false unless current_user
    user == current_user || current_user.admin? || organization.current_user_is_owner?
  end

  def organization_ids
    [organization_id]
  end

  def email_address
    @email_address || (user ? user.email_address : nil)
  end

  def first_name
    @first_name || (user ? user.first_name : nil)
  end

  def last_name
    @last_name || (user ? user.last_name : nil)
  end

  def before_create
    self.last_visited = Time.now

    if user = User.find(:email_address => email_address)
      self.user = user
    end
  end

  def wants_notifications?(period)
     wants_election_notifications?(period) ||
       wants_candidate_notifications?(period) ||
       wants_ranked_candidate_comment_notifications?(period) ||
       wants_own_candidate_comment_notifications?(period)

  end

  def wants_candidate_notifications?(period)
    notify_of_new_candidates == period
  end

  def wants_election_notifications?(period)
    notify_of_new_elections == period
  end

  def wants_ranked_candidate_comment_notifications?(period)
    notify_of_new_comments_on_ranked_candidates == period
  end

  def wants_own_candidate_comment_notifications?(period)
    notify_of_new_comments_on_own_candidates == period
  end

  def new_elections_in_period(period)
    organization.elections.
      where(Election[:created_at].gt(last_notified_or_visited_at(period))).
      where(Election[:creator_id].neq(user_id))
  end

  def new_candidates_in_period(period)
    user.votes.
      join(organization.elections).
      join_through(Candidate).
      where(Candidate[:created_at].gt(last_notified_or_visited_at(period))).
      where(Candidate[:creator_id].neq(user_id))
  end

  def new_comments_on_ranked_candidates_in_period(period)
    organization.elections.
      join(user.rankings).
      join(Candidate, Ranking[:candidate_id] => Candidate[:id]).
      where(Candidate[:creator_id].neq(user_id)).
      join_through(CandidateComment).
      where(CandidateComment[:created_at].gt(last_notified_or_visited_at(period))).
      where(CandidateComment[:creator_id].neq(user_id))
  end

  def new_comments_on_own_candidates_in_period(period)
    organization.elections.
      join(user.candidates).
      join_through(CandidateComment).
      where(CandidateComment[:created_at].gt((last_notified_or_visited_at(period)))).
      where(CandidateComment[:creator_id].neq(user_id))
  end

  protected

  # returns the time of last visit or the 1 <period> ago, whichever is more recent
  def last_notified_or_visited_at(period)
    [period_ago(period), last_visited].compact.max
  end

  def period_ago(period)
    case period
      when "every5"
        1.minute.ago
      when "hourly"
        1.hour.ago
      when "daily"
        1.day.ago
      when "weekly"
        1.week.ago
    end
  end
end

class CandidateComment < Prequel::Record
  column :id, :integer
  column :body, :string
  column :candidate_id, :integer
  column :creator_id, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :candidate
  belongs_to :creator, :class_name => "User"
  attr_accessor :suppress_current_user_membership_check
  delegate :organization, :to => :candidate

  include SupportsNotifications

  def organization_ids
    candidate ? candidate.organization_ids : []
  end

  def election
    candidate.election
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
    [:body, :candidate_id]
  end

  def update_whitelist
    [:body]
  end

  def before_create
    organization.ensure_current_user_is_member unless suppress_current_user_membership_check
    self.creator ||= current_user
  end

  def after_create
    send_immediate_notifications
    candidate.increment(:comment_count)
  end

  def after_destroy
    candidate.decrement(:comment_count)
  end

  def users_to_notify_immediately
    users_who_ranked_my_candidate = candidate.
      rankings.
      join(User).
      join(organization.memberships).
      where(:notify_of_new_comments_on_ranked_candidates => "immediately").
      where(Membership[:user_id].neq(creator_id)).
      project(User)

    user_who_created_my_candidate = candidate.
      organization.
        memberships.where(:user_id => candidate.creator_id, :notify_of_new_comments_on_own_candidates => "immediately").
        join_through(User)

    users_who_ranked_my_candidate | user_who_created_my_candidate
  end

  def extra_records_for_create_events
    [creator]
  end
end
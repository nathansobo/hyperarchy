class CandidateComment < Monarch::Model::Record
  column :body, :string
  column :candidate_id, :key
  column :creator_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :candidate
  belongs_to :creator, :class_name => "User"
  attr_accessor :suppress_notification_email, :suppress_current_user_membership_check
  delegate :organization, :to => :candidate

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
    unless suppress_notification_email
      Hyperarchy.defer { Hyperarchy::Notifier.send_immediate_notifications(self) }
    end
    if creator
      creator.memberships.find(:organization_id => election.organization_id).try(:update, :has_participated => true)
    end
  end

  def users_to_notify_immediately
    notify_users = candidate.
      rankings.
      join_to(User).
      join_to(organization.memberships).
      where(:notify_of_new_comments_on_ranked_candidates => "immediately").
      where(Membership[:user_id].neq(creator_id)).
      project(User).
      all

    candidate_creator_membership = organization.memberships.find(:user_id => candidate.creator_id)
    if candidate_creator_membership && candidate_creator_membership.wants_own_candidate_comment_notifications?("immediately")
      notify_users.push(candidate.creator)
    end
    notify_users
  end
end
class CandidateComment < Monarch::Model::Record
  column :body, :string
  column :candidate_id, :key
  column :creator_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :candidate
  belongs_to :creator, :class_name => "User"

  def organization_ids
    election ? election.organization_ids : []
  end

  def election
    candidate.election
  end

  def election_id
    election.id
  end

  def can_create?
    election.organization.has_member?(current_user)
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
    election.lock
    self.creator ||= current_user
  end

  def after_create
    election.unlock
  end

  def before_destroy
    election.lock
  end

  def after_destroy
    election.unlock
  end

end
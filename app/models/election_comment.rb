class ElectionComment < Prequel::Record
  column :id, :integer
  column :body, :string
  column :election_id, :integer
  column :creator_id, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :election
  belongs_to :creator, :class_name => 'User'

  def before_create
    self.creator = current_user
  end

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
    [:body, :election_id]
  end

  def update_whitelist
    [:body]
  end
end

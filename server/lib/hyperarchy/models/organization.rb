class Organization < Monarch::Model::Record
  column :name, :string
  column :description, :string, :default => ""

  has_many :elections
  has_many :memberships

  attr_accessor :suppress_membership_creation
  
  def after_create
    memberships.create(:user => current_user, :role => "owner", :pending => false) unless suppress_membership_creation
  end

  def has_member?(user)
    !memberships.find(:user_id => user.id).nil?
  end

  def organization_ids
    [id]
  end
end

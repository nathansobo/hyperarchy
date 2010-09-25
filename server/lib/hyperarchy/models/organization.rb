class Organization < Monarch::Model::Record
  column :name, :string
  column :description, :string, :default => ""

  has_many :elections
  has_many :memberships

  attr_accessor :suppress_membership_creation
  
  def after_create
    memberships.create(:user => current_user, :role => "owner", :pending => false) unless suppress_membership_creation
  end
end

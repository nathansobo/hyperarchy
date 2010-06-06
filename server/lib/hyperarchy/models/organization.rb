class Organization < Monarch::Model::Record
  column :name, :string
  column :description, :string

  has_many :elections
  has_many :memberships
  
  def after_create
    memberships.create(:user => current_user, :role => "owner")
  end
end

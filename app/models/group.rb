class Group < Prequel::Record
  column :id, :integer
  column :name, :string
  column :domain, :string
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :memberships

  def members
    @members ||= memberships.join_through(User)
  end

  def before_create
    self.name ||= domain
  end

  def add_member(user)
    memberships.create!(:user_id => user.id)
  end
end

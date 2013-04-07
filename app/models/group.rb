class Group < Prequel::Record
  column :id, :integer
  column :name, :string
  column :domain, :string
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :memberships
  has_many :questions

  def members
    @members ||= memberships.join_through(User)
  end

  def before_create
    self.name ||= domain
  end

  def add_member(user)
    memberships.find_or_create!(:user_id => user.id)
  end

  def has_member?(user)
    !!memberships.find(:user_id => user.id)
  end
end

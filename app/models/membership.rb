class Membership < Prequel::Record
  column :id, :integer
  column :group_id, :integer
  column :user_id, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :group
  belongs_to :user
end

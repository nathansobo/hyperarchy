class Membership < Monarch::Model::Record
  column :organization_id, :key
  column :user_id, :key

  belongs_to :organization
  belongs_to :user
end

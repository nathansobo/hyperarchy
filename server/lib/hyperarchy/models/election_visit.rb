class ElectionVisit < Monarch::Model::Record
  column :election_id, :key
  column :user_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :election
  belongs_to :user
end

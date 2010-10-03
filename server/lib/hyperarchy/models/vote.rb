class Vote < Monarch::Model::Record
  column :user_id, :key
  column :election_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :user
  belongs_to :election

  def updated
    update(:updated_at => Time.now)
  end
end
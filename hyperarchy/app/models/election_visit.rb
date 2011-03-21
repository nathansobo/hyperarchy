class ElectionVisit < Prequel::Record
  column :id, :integer
  column :election_id, :key
  column :user_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :election
  belongs_to :user

  def organization_ids
    election ? election.organization_ids : []
  end
end

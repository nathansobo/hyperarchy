class Election < Model::Record
  column :organization_id, :key
  column :body, :string

  has_many :candidates
  has_many :rankings
  has_many :majorities
end

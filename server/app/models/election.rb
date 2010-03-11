class Election < Model::Record
  column :organization_id, :key
  column :body, :string

  has_many :candidates
end

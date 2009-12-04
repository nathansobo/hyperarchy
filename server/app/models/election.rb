class Election < Model::Record
  column :organization_id, :string
  column :body, :string

  has_many :candidates
end

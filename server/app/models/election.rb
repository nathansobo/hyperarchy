class Election < Model::Record
  column :body, :string
  column :organization_id, :string
  
  has_many :candidates
end

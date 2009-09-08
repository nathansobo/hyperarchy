class Election < Model::Record
  column :body, :string
  
  has_many :candidates
end

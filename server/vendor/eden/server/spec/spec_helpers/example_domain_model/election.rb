class Election < Model::Tuple
  column :body, :string
  
  has_many :candidates
end

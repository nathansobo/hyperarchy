class Election < Model::Tuple
  attribute :body, :string
  
  has_many :candidates
end
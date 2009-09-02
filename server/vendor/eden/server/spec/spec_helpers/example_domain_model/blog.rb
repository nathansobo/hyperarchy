class Blog < Model::Tuple
  column :body, :string
  
  has_many :candidates
end

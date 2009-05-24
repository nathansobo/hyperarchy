class User < Model::Tuple
  attribute :full_name, :string

  relates_to_many :elections do
    Election.set
  end

  relates_to_many :candidates do
    Candidate.set
  end
end
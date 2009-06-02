class Election < Model::Tuple
  attribute :body, :string

  # has_many :answers
  relates_to_many :candidates do
    Candidate.where(Candidate[:election_id].eq(id))
  end
end
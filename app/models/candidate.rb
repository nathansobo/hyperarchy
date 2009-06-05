class Candidate < Model::Tuple
  attribute :body, :string
  attribute :election_id, :string

  belongs_to :election
end
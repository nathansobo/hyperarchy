class Candidate < Model::Tuple
  attribute :body, :string
  attribute :election_id, :string

  #  belongs_to :question
  relates_to_one :election do
    Election.where(Election[:id].eq(election_id))
  end
end
class Candidate < Model::Tuple
  column :body, :string
  column :election_id, :string

  belongs_to :election
end

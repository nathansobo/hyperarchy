class Candidate < Model::Record
  column :body, :string
  column :election_id, :string

  belongs_to :election
end

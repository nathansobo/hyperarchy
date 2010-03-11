class Candidate < Model::Record
  column :body, :string
  column :election_id, :key

  belongs_to :election
end

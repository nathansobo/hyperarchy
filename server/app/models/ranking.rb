class Ranking < Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float
end
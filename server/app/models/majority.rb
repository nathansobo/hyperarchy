class Majority < Model::Record
  column :winner_id, :key
  column :loser_id, :key

  belongs_to :winner, :class_name => "Candidate"
  belongs_to :loser, :class_name => "Candidate"
end
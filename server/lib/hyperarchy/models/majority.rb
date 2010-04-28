class Majority < Monarch::Model::Record
  column :election_id, :key
  column :winner_id, :key
  column :loser_id, :key
  column :count, :integer, :default => 0

  belongs_to :election
  belongs_to :winner, :class_name => "Candidate"
  belongs_to :loser, :class_name => "Candidate"
end
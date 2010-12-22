class Majority < Monarch::Model::Record
  column :election_id, :key
  column :winner_id, :key
  column :loser_id, :key
  column :pro_count, :integer, :default => 0
  column :con_count, :integer, :default => 0
  column :winner_created_at, :datetime

  belongs_to :election
  belongs_to :winner, :class_name => "Candidate"
  belongs_to :loser, :class_name => "Candidate"

  def before_create
    self.winner_created_at = winner.created_at
  end
end
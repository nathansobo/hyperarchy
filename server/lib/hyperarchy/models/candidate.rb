class Candidate < Model::Record
  column :body, :string
  column :election_id, :key
  column :position, :integer

  belongs_to :election

  def after_create
    Candidate.where(Candidate[:id].neq(id)).each do |other_candidate|
      Majority.create({:winner => self, :loser => other_candidate, :election_id => election_id})
      Majority.create({:winner => other_candidate, :loser => self, :election_id => election_id})
    end
  end
end
class Candidate < Model::Record
  column :body, :string
  column :election_id, :key

  belongs_to :election

  def after_create
    Candidate.where(Candidate[:id].neq(id)).each do |other_candidate|
      Majority.create({:winner => self, :loser => other_candidate})
      Majority.create({:winner => other_candidate, :loser => self})
    end
  end
end

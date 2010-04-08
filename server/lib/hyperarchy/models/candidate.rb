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
    
    # group the rankings on the election candidate id and count them
    # produce candidate_id, count relation representing the number of times each candidate has been ranked in the election
    # then join this to the newly created majorities where winner id is the candidate from the count and loser is the newly created candidate and update
  end
end
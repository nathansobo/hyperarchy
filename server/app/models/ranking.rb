class Ranking < Model::Record
  column :user_id, :key
  column :election_id, :key
  column :candidate_id, :key
  column :position, :float

  belongs_to :user
  belongs_to :candidate
  belongs_to :election

  def after_create
    election.majorities.where(:winner_id => candidate_id).update(:count => Majority[:count] + 1)
#    election.majorities.where(:winner_id => candidate_id).each do |majority|
#      majority.count += 1
#      majority.save
#    end
  end

end
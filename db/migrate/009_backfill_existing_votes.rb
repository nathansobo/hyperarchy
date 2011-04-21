Sequel.migration do
  up do
    # create a vote for every distinct user_id election_id combination
    needed_votes = self[:rankings].select(:user_id, :election_id).distinct
    needed_votes.each do |needed_vote|
      user_id = needed_vote[:user_id]
      election_id = needed_vote[:election_id]

      vote_id = self[:votes].insert(
        :user_id => user_id,
        :election_id => election_id,
        :created_at => Time.now,
        :updated_at => Time.now
      )

      # update all the rankings with their vote_id
      self[:rankings].
        filter(:user_id => user_id, :election_id => election_id).
        update(:vote_id => vote_id)
    end

    # update every election with the number of votes that have been cast
    self[:elections].select(:id).each do |r|
      election_id = r[:id]
      vote_count = self[:votes].filter(:election_id => election_id).count
      self[:elections].filter(:id => election_id).update(:vote_count => vote_count)
    end
  end
end

module Jobs
  class UpdateElectionScores < Resque::JobWithStatus
    @queue = 'update_election_scores'

    def perform
      Election.update_scores
      completed
    end
  end
end

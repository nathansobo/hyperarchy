unless Rails.env.test?
  EventObserver.observe(Candidate, CandidateComment, Election, ElectionComment, Membership, Organization, Ranking, User, Vote)
end

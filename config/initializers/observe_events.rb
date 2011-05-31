unless Rails.env.test?
  EventObserver.observe(Candidate, CandidateComment, Election, Membership, Organization, Ranking, User, Vote)
end

unless Rails.env.test?
  EventObserver.observe(Candidate, CandidateComment, Question, QuestionComment, Membership, Organization, Ranking, User, Vote)
end

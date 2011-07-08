unless Rails.env.test?
  EventObserver.observe(Answer, AnswerComment, Question, QuestionComment, Membership, Organization, Ranking, User, Vote)
end

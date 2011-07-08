module Jobs
  class UpdateQuestionScores < Resque::JobWithStatus
    @queue = 'update_question_scores'

    def perform
      Question.update_scores
      completed
    end
  end
end

#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Jobs
  class UpdateQuestionScores < Resque::JobWithStatus
    @queue = 'update_question_scores'

    def perform
      Question.update_scores
      completed
    end
  end
end

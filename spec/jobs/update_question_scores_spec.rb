require 'spec_helper'

module Jobs
  describe UpdateQuestionScores do
    let(:job) { UpdateQuestionScores.new('job_id') }

    describe "#perform" do
      it "calls Question.update_scores" do
        mock(Question).update_scores
        mock(job).completed

        job.perform
      end
    end
  end
end
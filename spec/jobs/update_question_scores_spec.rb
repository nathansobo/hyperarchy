require 'spec_helper'

module Jobs
  describe UpdateElectionScores do
    let(:job) { UpdateElectionScores.new('job_id') }

    describe "#perform" do
      it "calls Election.update_scores" do
        mock(Election).update_scores
        mock(job).completed

        job.perform
      end
    end
  end
end
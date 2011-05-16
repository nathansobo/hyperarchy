require 'spec_helper'

module Jobs
  describe SendNotifications do
    let(:job) { SendNotifications.new('period' => period) }
    let(:period) { 'hourly' }

    describe "#users_to_notify" do
      it "returns those users who have at least one membership with a notification preference matching the job's period" do
        m1 = make_membership('hourly', 'never', 'never', 'never')
        m2 = make_membership('never', 'hourly', 'never', 'never')
        m3 = make_membership('never', 'never', 'hourly', 'never')
        m4 = make_membership('never', 'never', 'never', 'hourly')
        make_membership('never', 'never', 'never', 'never')

        job.users_to_notify.all.map(&:id).should == [m1, m2, m3, m4].map(&:user).map(&:id)
      end

      def make_membership(elections, candidates, comments_on_ranked, comments_on_own)
        Membership.make(
          :notify_of_new_elections => elections,
          :notify_of_new_candidates => candidates,
          :notify_of_new_comments_on_own_candidates => comments_on_ranked,
          :notify_of_new_comments_on_ranked_candidates => comments_on_own
        )
      end
    end
  end
end
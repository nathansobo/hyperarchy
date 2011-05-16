require 'spec_helper'

module Views
  module NotificationMailer
    describe MembershipPresenter do

      let :membership do
        Membership.make(
          :notify_of_new_elections => new_elections,
          :notify_of_new_candidates => new_candidates,
          :notify_of_new_comments_on_own_candidates => new_comments_on_own_candidates,
          :notify_of_new_comments_on_ranked_candidates => new_comments_on_ranked_candidates
        )
      end

      let(:new_elections) { 'hourly' }
      let(:new_candidates) { 'hourly' }
      let(:new_comments_on_own_candidates) { 'hourly' }
      let(:new_comments_on_ranked_candidates) { 'hourly' }

      before do
        stub(membership) do |m|
          m.new_elections_in_period('hourly') { [] }
          m.new_candidates_in_period('hourly') { [] }
          m.new_comments_on_ranked_candidates_in_period('hourly') { [] }
          m.new_comments_on_own_candidates_in_period('hourly') { [] }
        end
      end

      describe "when the user elects not to receive new election notifications for this period" do
        let(:new_elections) { 'weekly' }

        it "does not query them from the membership" do
          dont_allow(membership).new_elections_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new candidate notifications for this period" do
        let(:new_candidates) { 'never' }

        it "does not query them from the membership" do
          dont_allow(membership).new_candidates_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new comment notifications on their own candidates for this period" do
        let(:new_comments_on_own_candidates) { 'immediately' }

        it "does not query them from the membership" do
          dont_allow(membership).new_comments_on_own_candidates_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new comment notifications on candidates they have ranked for this period" do
        let(:new_comments_on_ranked_candidates) { 'daily' }

        it "does not query them from the membership" do
          dont_allow(membership).new_comments_on_ranked_candidates_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects to receive all notifications" do
        it "calls all the methods we expect on membership to report results (these methods are unit tested individually)" do
          mock(membership) do |m|
            m.new_elections_in_period('hourly') { [] }
            m.new_candidates_in_period('hourly') { [] }
            m.new_comments_on_ranked_candidates_in_period('hourly') { [] }
            m.new_comments_on_own_candidates_in_period('hourly') { [] }
          end
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end
    end
  end
end
require 'spec_helper'

module Views
  module NotificationMailer
    describe MembershipPresenter do

      let :membership do
        Membership.make(
          :notify_of_new_questions => new_questions,
          :notify_of_new_answers => new_answers,
          :notify_of_new_comments_on_own_answers => new_comments_on_own_answers,
          :notify_of_new_comments_on_ranked_answers => new_comments_on_ranked_answers
        )
      end

      let(:new_questions) { 'hourly' }
      let(:new_answers) { 'hourly' }
      let(:new_comments_on_own_answers) { 'hourly' }
      let(:new_comments_on_ranked_answers) { 'hourly' }

      before do
        stub(membership) do |m|
          m.new_questions_in_period('hourly') { [] }
          m.new_answers_in_period('hourly') { [] }
          m.new_comments_on_ranked_answers_in_period('hourly') { [] }
          m.new_comments_on_own_answers_in_period('hourly') { [] }
        end
      end

      describe "when the user elects not to receive new question notifications for this period" do
        let(:new_questions) { 'weekly' }

        it "does not query them from the membership" do
          dont_allow(membership).new_questions_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new answer notifications for this period" do
        let(:new_answers) { 'never' }

        it "does not query them from the membership" do
          dont_allow(membership).new_answers_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new comment notifications on their own answers for this period" do
        let(:new_comments_on_own_answers) { 'immediately' }

        it "does not query them from the membership" do
          dont_allow(membership).new_comments_on_own_answers_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects not to receive new comment notifications on answers they have ranked for this period" do
        let(:new_comments_on_ranked_answers) { 'daily' }

        it "does not query them from the membership" do
          dont_allow(membership).new_comments_on_ranked_answers_in_period
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end

      describe "when the user elects to receive all notifications" do
        it "calls all the methods we expect on membership to report results (these methods are unit tested individually)" do
          mock(membership) do |m|
            m.new_questions_in_period('hourly') { [] }
            m.new_answers_in_period('hourly') { [] }
            m.new_comments_on_ranked_answers_in_period('hourly') { [] }
            m.new_comments_on_own_answers_in_period('hourly') { [] }
          end
          MembershipPresenter.new(membership, 'hourly', nil)
        end
      end
    end
  end
end
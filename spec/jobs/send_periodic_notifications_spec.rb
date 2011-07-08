require 'spec_helper'

module Jobs
  describe SendPeriodicNotifications do
    let(:job) { SendPeriodicNotifications.new('job_id', 'period' => period) }
    let(:period) { 'hourly' }

    describe "#perform" do
      it "sends a NotificationMailer.notification for every user to notify with the given period that has notifications" do
        user1 = User.make
        user2 = User.make
        user3 = User.make
        user4 = User.make
        user1_membership = user1.memberships.first
        user2_membership = user2.memberships.first
        user3_membership = user3.memberships.first
        user4_membership = user4.memberships.first
        user1_membership.update!(:notify_of_new_questions => period)
        user2_membership.update!(:notify_of_new_questions => period)
        user3_membership.update!(:notify_of_new_questions => period)
        user4_membership.update!(:notify_of_new_questions => 'never', :notify_of_new_candidates => period)

        new_question = Organization.social.questions.make

        mock(user1.memberships.first).new_questions_in_period(period) { [new_question] }
        mock(user2.memberships.first).new_questions_in_period(period) { [new_question] }
        mock(user3.memberships.first).new_questions_in_period(period) { [new_question] }

        mock(NotificationMailer).notification(user1, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        mock(NotificationMailer).notification(user2, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver { raise "Email failed "}
        mock(NotificationMailer).notification(user3, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        dont_allow(NotificationMailer).notification(user4, is_a(Views::NotificationMailer::NotificationPresenter))

        mock(job).at(1, 4)
        mock(job).at(2, 4)
        mock(job).at(3, 4)
        mock(job).at(4, 4)
        mock(job).completed

        job.perform
      end

      it "doesn't send notifications to users with email disabled" do
        user1 = User.make
        user1_membership = user1.memberships.first
        user1_membership.update!(:notify_of_new_questions => period)

        new_question = Organization.social.questions.make
        user1.update!(:email_enabled => false)

        stub(user1.memberships.first).new_questions_in_period(period) { [new_question] }
        dont_allow(NotificationMailer).notification

        mock(job).completed
        job.perform
      end
    end
  end
end
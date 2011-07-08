require 'spec_helper'

module Jobs
  describe SendImmediateNotifications do
    let(:question) { Question.make }
    let(:job) { SendImmediateNotifications.new('job_id', 'class_name' => 'Question', 'id' => question.id) }

    describe "#perform" do
      it "sends a NotificationMailer.notification for every user to notify immediately" do
        organization = question.organization
        user1 = organization.make_member
        user2 = organization.make_member
        user3 = organization.make_member
        user1_membership = organization.memberships.find(:user => user1)
        user2_membership = organization.memberships.find(:user => user2)
        user3_membership = organization.memberships.find(:user => user3)
        user1_membership.update!(:notify_of_new_questions => 'immediately')
        user2_membership.update!(:notify_of_new_questions => 'immediately')
        user3_membership.update!(:notify_of_new_questions => 'never')

        question.users_to_notify_immediately.should_not be_empty

        mock(NotificationMailer).notification(user1, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        mock(NotificationMailer).notification(user2, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        dont_allow(NotificationMailer).notification(user3, is_a(Views::NotificationMailer::NotificationPresenter))

        mock(job).at(1, 2)
        mock(job).at(2, 2)
        mock(job).completed

        job.perform
      end

      it "doesn't send notifications to users with email disabled" do
        organization = question.organization
        user1 = organization.make_member
        user1.update!(:email_enabled => false)
        user1_membership = organization.memberships.find(:user => user1)
        user1_membership.update!(:notify_of_new_questions => 'immediately')

        dont_allow(NotificationMailer).notification

        mock(job).completed
        job.perform
      end
    end
  end
end
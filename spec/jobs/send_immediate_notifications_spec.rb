require 'spec_helper'

module Jobs
  describe SendImmediateNotifications do
    let(:election) { Election.make }
    let(:job) { SendImmediateNotifications.new('job_id', 'class_name' => 'Election', 'id' => election.id) }

    describe "#perform" do
      it "sends a NotificationMailer.notification for every user to notify immediately" do
        organization = election.organization
        user1 = organization.make_member
        user2 = organization.make_member
        user3 = organization.make_member
        user1_membership = organization.memberships.find(:user => user1)
        user2_membership = organization.memberships.find(:user => user2)
        user3_membership = organization.memberships.find(:user => user3)
        user1_membership.update!(:notify_of_new_elections => 'immediately')
        user2_membership.update!(:notify_of_new_elections => 'immediately')
        user3_membership.update!(:notify_of_new_elections => 'never')

        election.users_to_notify_immediately.should_not be_empty

        mock(NotificationMailer).notification(user1, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        mock(NotificationMailer).notification(user2, is_a(Views::NotificationMailer::NotificationPresenter)).mock!.deliver
        dont_allow(NotificationMailer).notification(user3, is_a(Views::NotificationMailer::NotificationPresenter))

        mock(job).at(1, 2)
        mock(job).at(2, 2)

        job.perform
      end
    end
  end
end
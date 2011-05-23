require 'spec_helper'

module Jobs
  describe SendNotifications do
    let(:job) { SendNotifications.new('job_id', 'period' => period) }
    let(:period) { 'hourly' }

    describe "#perform" do
      it "sends a NotificationMailer.notification for every user to notify with the given period" do
        user1 = User.make
        user2 = User.make

        mock(User).users_to_notify(period) { [user1, user2] }

        mock(NotificationMailer).notification(user1, period).mock!.deliver
        mock(NotificationMailer).notification(user2, period).mock!.deliver

        mock(job).at(1, 2)
        mock(job).at(2, 2)
        
        job.perform
      end
    end
  end
end
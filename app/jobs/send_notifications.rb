module Jobs
  class SendNotifications < Resque::JobWithStatus
    @queue = 'send_notifications'


    def perform
      User.users_to_notify(period).each do |user|
        NotificationMailer.notification(user, period).deliver
      end
    end

    def period
      options['period']
    end
  end
end
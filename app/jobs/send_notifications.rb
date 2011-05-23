module Jobs
  class SendNotifications < Resque::JobWithStatus
    @queue = 'send_notifications'

    def perform
      users_to_notify = User.users_to_notify(period)
      total = users_to_notify.count
      users_to_notify.each_with_index do |user, i|
        at(i + 1, total)
        NotificationMailer.notification(user, period).deliver
      end
    end

    def period
      options['period']
    end
  end
end
module Jobs
  class SendPeriodicNotifications < Resque::JobWithStatus
    @queue = 'send_periodic_notifications'

    def perform
      users_to_notify = User.users_to_notify(period)
      total = users_to_notify.count
      users_to_notify.each_with_index do |user, i|
        at(i + 1, total)
        next unless user.email_enabled?
        presenter = Views::NotificationMailer::NotificationPresenter.new(user, period)
        unless presenter.empty?
          NotificationMailer.notification(user, presenter).deliver
        end
      end
      completed
    end

    def period
      options['period']
    end
  end
end
module Jobs
  class SendPeriodicNotifications < Resque::JobWithStatus
    @queue = 'send_periodic_notifications'

    def perform
      puts "sending #{period} notifications"
      users_to_notify = User.users_to_notify(period)
      total = users_to_notify.count
      puts "about to email #{total} users"
      users_to_notify.each_with_index do |user, i|
        at(i + 1, total)
        next unless user.email_enabled?
        puts "notifying #{user.email_address}"
        presenter = Views::NotificationMailer::NotificationPresenter.new(user, period)
        unless presenter.empty?
          "actually sending non-empty notification"
          NotificationMailer.notification(user, presenter).deliver
        else
          puts "empty notification, skipping"
        end
      end
      completed
    end

    def period
      options['period']
    end
  end
end
#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Jobs
  class SendPeriodicNotifications < Resque::JobWithStatus
    @queue = 'send_periodic_notifications'

    def perform
      Rails.logger.info("sending #{period} notifications")
      users_to_notify = User.users_to_notify(period)
      total = users_to_notify.count
      Rails.logger.info("about to email #{total} users")
      users_to_notify.each_with_index do |user, i|
        begin
          at(i + 1, total)
          next unless user.email_enabled?
          Rails.logger.info("computing notification for #{user.email_address}")
          presenter = Views::NotificationMailer::NotificationPresenter.new(user, period)
          unless presenter.empty?
            Rails.logger.info("sending notification to #{user.email_address}")
            NotificationMailer.notification(user, presenter).deliver
          end
        rescue Exception => e
          message = "Error sending to #{user.email_address}\n" + e.message + "\n" + e.backtrace * "\n\t"
          Rails.logger.error(message)
        end
      end
      completed
    end

    def period
      options['period']
    end
  end
end
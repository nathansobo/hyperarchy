module Hyperarchy
  class Notifier
    class << self
      def instance
        @instance ||= new
      end

      delegate :send_periodic_notifications, :send_immediate_notifications, :to => :instance
    end


    def send_periodic_notifications(period)
      period = period.to_s

      User.each do |user|
        begin
          send_notification_to_user(user, Emails::NotificationPresenter.new(user, period))
        rescue Exception => e
          msg = ["#{e.class} - #{e.message}:", *e.backtrace].join("\n ")
          LOGGER.error(msg)
        end
      end
    end

    def send_immediate_notifications(item)
      item.users_to_notify_immediately.each do |user|
        begin
          send_notification_to_user(user, Emails::NotificationPresenter.new(user, "immediately", item))
        rescue Exception => e
          msg = ["#{e.class} - #{e.message}:", *e.backtrace].join("\n ")
          LOGGER.error(msg)
        end
      end
    end

    def send_notification_to_user(user, notification_presenter)
      return if notification_presenter.empty?
      return unless user.email_enabled?
      Mailer.send(
        :to => user.email_address,
        :subject => notification_presenter.subject,
        :notification_presenter => notification_presenter,
        :body => notification_presenter.to_s,
        :erector_class => Emails::Notification
      )
    end
  end
end
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
        send_notification_to_user(user, Emails::NotificationPresenter.new(user, period))
      end
    end

    def send_immediate_notifications(item)
      item.users_to_notify_immediately.each do |user|
        send_notification_to_user(user, Emails::NotificationPresenter.new(user, "immediately", item))
      end
    end

    def send_notification_to_user(user, notification_presenter)
      return if notification_presenter.empty?
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
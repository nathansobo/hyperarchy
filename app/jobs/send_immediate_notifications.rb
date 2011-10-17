#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Jobs
  class SendImmediateNotifications < Resque::JobWithStatus
    @queue = 'send_immediate_notifications'

    def perform
      users_to_notify = item.users_to_notify_immediately

      total = users_to_notify.count
      users_to_notify.each_with_index do |user, i|
        at(i + 1, total)
        next unless user.email_enabled?
        presenter = Views::NotificationMailer::NotificationPresenter.new(user, 'immediately', item)
        NotificationMailer.notification(user, presenter).deliver
      end
      completed
    end

    def item
      options['class_name'].constantize.find(options['id'])
    end
  end
end
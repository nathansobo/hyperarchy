module Jobs
  class SendNotifications < Resque::JobWithStatus
    attr_reader :params
    
    def initialize(params)
      @params = params
    end

    def perform
      User.users_to_notify(period).each do |user|
        NotificationMailer.notification(user, period).deliver
      end
    end

    def period
      params['period']
    end
  end
end
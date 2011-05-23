module Jobs
  class SendNotifications < Resque::JobWithStatus
    attr_reader :params
    
    def initialize(params)
      @params = params
    end

    def period
      params['period']
    end
  end
end
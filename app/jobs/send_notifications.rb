module Jobs
  class SendNotifications < Resque::JobWithStatus
    attr_reader :params
    
    def initialize(params)
      @params = params
    end

    def period
      params['period']
    end

    def users_to_notify
      Membership.where_any(
        :notify_of_new_elections => period,
        :notify_of_new_candidates => period,
        :notify_of_new_comments_on_own_candidates => period,
        :notify_of_new_comments_on_ranked_candidates => period
      ).join_through(User)
    end
  end
end
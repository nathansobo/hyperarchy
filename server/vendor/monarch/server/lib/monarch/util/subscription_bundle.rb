module Util
  class SubscriptionBundle
    attr_reader :subscriptions

    def initialize
      @subscriptions = []
    end

    def add(subscription)
      subscriptions.push(subscription)
    end
    
    def destroy_all
      subscriptions.each {|s| s.destroy}
    end
  end
end

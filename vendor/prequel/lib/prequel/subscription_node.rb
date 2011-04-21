module Prequel
  class SubscriptionNode
    def initialize
      @subscriptions = []
    end

    def subscribe(&proc)
      subscriptions.push(proc)
    end

    def publish(*args)
      subscriptions.each do |proc|
        proc.call(*args)
      end
    end

    protected
    attr_reader :subscriptions
  end
end
module Util
  class SubscriptionNode
    def initialize
      @subscriptions = []
    end

    def subscribe(&proc)
      subscriptions.push(proc)
    end

    def publish(*args)
      subscriptions.each { |proc| proc.call(*args) }
    end

    protected
    attr_reader :subscriptions
  end
end

module Util
  class Subscription
    def initialize(subscription_node, proc)
      @subscription_node = subscription_node
      @proc = proc
    end

    def call(*args)
      proc.call(*args)
    end

    def destroy
      subscription_node.unsubscribe(self)
    end

    protected
    attr_reader :subscription_node, :proc
  end
end

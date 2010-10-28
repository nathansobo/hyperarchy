module Monarch
  module Util
    class SubscriptionNode
      thread_local_accessor :events_paused, :enqueued_events

      def initialize
        @subscriptions = []
      end

      def subscribe(&proc)
        subscription = Subscription.new(self, proc)
        subscriptions.push(subscription)
        subscription
      end

      def unsubscribe(subscription)
        subscriptions.delete(subscription)
        on_unsubscribe_node.publish if on_unsubscribe_node
      end

      def publish(*args)
        if events_paused
          enqueued_events.push(args)
        else
          subscriptions.each { |subscription| subscription.call(*args) }
        end
      end

      def on_unsubscribe(&proc)
        @on_unsubscribe_node = SubscriptionNode.new unless on_unsubscribe_node
        on_unsubscribe_node.subscribe(&proc)
      end

      def pause
        self.events_paused = true
        self.enqueued_events = []
      end

      def resume
        self.events_paused = false
        enqueued_events.each do |event|
          publish(*event)
        end
        self.enqueued_events = nil
      end

      def cancel
        self.events_paused = false
        self.enqueued_events = nil
      end

      def count
        subscriptions.size
      end

      def clear
        @subscriptions = []
        self.enqueued_events = nil
      end

      protected
      attr_reader :subscriptions, :on_unsubscribe_node
    end
  end
end
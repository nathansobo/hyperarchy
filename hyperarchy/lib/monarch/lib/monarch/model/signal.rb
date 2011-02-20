module Monarch
  module Model
    class Signal
      attr_reader :value

      def initialize(source, &transformer)
        @source, @transformer = source, transformer
        @update_node = Util::SubscriptionNode.new

        source.on_update do |new_value|
          update_node.publish(transformer.call(new_value))
        end
      end

      def value
        transformer.call(source.value)
      end

      def remote_value
        transformer.call(source.remote_value)
      end

      def on_update(&proc)
        update_node.subscribe(&proc)
      end

      protected
      attr_reader :source, :transformer, :proc, :update_node
    end
  end
end
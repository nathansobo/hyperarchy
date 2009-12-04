module Pusher
  module Channel
    class InMemory
      def initialize
        @queues = {}
      end
      
      def subscribe(channel_id, session_id, transport)
        @queues[channel_id] = transport
        transport.on_close { @queues.delete(channel_id) }
      end
      
      def publish(channel_id, message)
        @queues[channel_id].write message if @queues.has_key?(channel_id)
      end
    end
  end
end
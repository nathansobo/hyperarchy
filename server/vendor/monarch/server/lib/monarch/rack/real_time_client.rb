module Monarch
  module Rack
    class RealTimeClient
      RECONNECT_INTERVAL = 5
      attr_reader :id, :connection, :hub

      def initialize(id, hub)
        @id, @hub = id, hub
        @current_subscriptions = {}
        @queued_messages = []
        start_reconnect_timer
      end

      def connection=(connection)
        @connection = connection
        if connection
          puts "Got new connection for #{id}"
          cancel_reconnect_timer
          flush_queued_messages
        else
          puts "Connection dropped for #{id}, dying in #{RECONNECT_INTERVAL} seconds"
          start_reconnect_timer
        end
      end

      def send(message)
        if connection
          connection.render(message.to_json + "\n")
        else
          queued_messages.push(message)
        end
      end

      def flush_queued_messages
        while !queued_messages.empty?
          send(queued_messages.shift)
        end
      end

      def subscribe(node_or_relation)
        subscription = node_or_relation.is_a?(Model::Relations::Relation) ?
          subscribe_to_relation(node_or_relation) : subscribe_to_node(node_or_relation)
        subscription_id = Guid.new.to_s
        current_subscriptions[subscription_id] = subscription
        subscription_id
      end

      def subscribe_to_node(node)
        node.subscribe do |message|
          send(message)
        end
      end

      def subscribe_to_relation(relation)
        bundle = Util::SubscriptionBundle.new

        bundle.add(relation.on_insert do |record|
          send(["create", relation.exposed_name.to_s, record.wire_representation])
        end)

        bundle.add(relation.on_update do |record, changeset|
          send(["update", relation.exposed_name.to_s, record.id, changeset.wire_representation])
        end)

        bundle.add(relation.on_remove do |record|
          send(["destroy", relation.exposed_name.to_s, record.id])
        end)

        bundle
      end

      def unsubscribe(subscription_id)
        subscription_bundle = current_subscriptions.delete(subscription_id)
        subscription_bundle.destroy
      end

      def unsubscribe_all
        current_subscriptions.values.each do |subscription|
          subscription.destroy
        end
      end

      private
      attr_reader :reconnect_timer, :queued_messages, :current_subscriptions

      def start_reconnect_timer
        @reconnect_timer = EM::Timer.new(RECONNECT_INTERVAL) do
          puts "Client #{id} going offline"
          went_offline
        end
      end

      def cancel_reconnect_timer
        reconnect_timer.cancel if reconnect_timer
      end

      def went_offline
        hub.remove_client(id)
        unsubscribe_all
      end
    end
  end
end
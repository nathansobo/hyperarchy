module Http
  class CometClient
    RECONNECT_INTERVAL = 5
    attr_reader :id, :transport, :hub, :subscriptions

    def initialize(id, hub)
      @id, @hub = id, hub
      @subscriptions = Util::SubscriptionBundle.new
      start_reconnect_timer
    end

    def transport=(transport)
      @transport = transport
      cancel_reconnect_timer
      flush_queued_messages
      transport.on_close do
        start_reconnect_timer
      end
    end

    def send(message)
      if transport
        transport.write(message.to_json + "\n")
      else
        queued_messages.push(message)
      end
    end

    def flush_queued_messages
      while !queued_messages.empty?
        send(queued_messages.shift)
      end
    end

    def subscribe(relation)
      subscriptions.add(relation.on_insert do |record|
        send(["create", relation.exposed_name, relation.wire_representation])
      end)
    end

    private
    attr_reader :reconnect_timer

    def start_reconnect_timer
      @reconnect_timer = EM::Timer.new(RECONNECT_INTERVAL) do
        went_offline
      end
    end

    def cancel_reconnect_timer
      reconnect_timer.cancel if reconnect_timer
    end

    def went_offline
      puts "#{id} went offline!!!!!!"
      hub.remove_client(id)
    end
  end
end

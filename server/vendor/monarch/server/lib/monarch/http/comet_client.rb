module Http
  class CometClient
    RECONNECT_INTERVAL = 5
    attr_reader :id, :transport, :hub

    def initialize(id, hub)
      @id, @hub = id, hub
      start_reconnect_timer
    end

    def transport=(transport)
      @transport = transport
      cancel_reconnect_timer
      transport.on_close do
        start_reconnect_timer
      end
    end

    def send(message)
      transport.write(message) if transport
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

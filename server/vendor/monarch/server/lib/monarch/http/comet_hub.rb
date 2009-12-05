module Http
  class CometHub
    PING_INTERVAL = 5
    ASYNC_RESPONSE = [-1, {}, []].freeze

    attr_reader :clients
    def initialize
      @clients = {}
    end

    def call(request)
      on_start unless @started
      client_id = request[:comet_client_id]
      transport = Pusher::Transport.select(request[:transport]).new(request)

      find_or_build(client_id).transport = transport
      EM.next_tick { request.async_callback.call(transport.render) }
      ASYNC_RESPONSE
    end

    def find_or_build(client_id)
      if clients.has_key?(client_id)
        clients[client_id]
      else
        clients[client_id] = CometClient.new(client_id, self)
      end
    end

    def remove_client(client_id)
      clients.delete(client_id)
    end

    private
    def on_start
      EM.add_periodic_timer(PING_INTERVAL) { Pusher::Transport.ping_all }
      @started = true
    end
  end
end

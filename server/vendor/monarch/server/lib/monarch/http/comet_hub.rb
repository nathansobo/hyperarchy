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

      client_id = request[:session_id]
      transport = Pusher::Transport.select(request[:transport]).new(request)

      if clients.has_key?(client_id)
        clients[client_id].transport = transport
      else

        puts "adding client #{request.params.inspect}"
        clients[client_id] = CometClient.new(client_id, transport, self)
      end

      EM.next_tick { request.async_callback.call(transport.render) }
      ASYNC_RESPONSE
    end


    private
    def on_start
      EM.add_periodic_timer(PING_INTERVAL) { Pusher::Transport.ping_all }
      EM.add_periodic_timer(2) do
        p clients
        clients.values.each do |client|
          client.send("HELLO!!!!!!!!")
        end
      end
      @started = true
    end
  end
end
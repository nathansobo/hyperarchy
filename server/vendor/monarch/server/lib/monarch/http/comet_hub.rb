module Http
  class CometHub < Resource
    PING_INTERVAL = 5
    ASYNC_RESPONSE = [-1, {}, []].freeze

    class << self
      def instance
        @instance ||= new
      end
    end

    attr_reader :clients
    def initialize
      @clients = {}
    end

    def post(params)
      on_start unless @started
      client_id = params[:comet_client_id]
      transport = Pusher::Transport.select(params[:transport]).new(current_request)
      current_comet_client.transport = transport
      EM.next_tick { current_request.async_callback.call(transport.render) }
      ASYNC_RESPONSE
    end

    def find_or_build_comet_client(client_id)
      if clients.has_key?(client_id)
        clients[client_id]
      else
#        puts "#{client_id} came online"
        clients[client_id] = CometClient.new(client_id, self)
      end
    end

    def remove_client(client_id)
#      puts "client #{client_id} went offline"
      clients.delete(client_id)
    end

    private
    def on_start
      EM.add_periodic_timer(PING_INTERVAL) do
        Pusher::Transport.ping_all
      end
      @started = true
    end
  end
end

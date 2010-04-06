require 'cramp/controller'

module Http
  class RealTimeHub
    RACK_ENV_KEY = "real_time_hub"

    attr_reader :app, :comet_handler, :clients
    def initialize(app)
      @app = app
      @comet_handler = CometHandler
      @clients = Hash.new { |clients, id| clients[id] = RealTimeClient.new(id, self) }
    end

    def call(env)
      env[RACK_ENV_KEY] = self
      case env['PATH_INFO']
      when "/comet"
        comet_handler.call(env)
      else
        app.call(env)
      end
    end

    def client_connected(client_id, connection)
      clients[client_id].connection = connection
    end

    def client_disconnected(client_id)
      clients[client_id].connection = nil
    end

    def remove_client(client_id)
      clients.delete(client_id)
    end

    class CometHandler < Cramp::Controller::Action
      attr_reader :env, :client_id
      keep_connection_alive
      on_start :register_connection
      on_finish :register_disconnection

      def respond_with
        [200, {'Content-Type', 'application/x-event-stream'}]
      end

      def register_connection
        @client_id = params["client_id"] || Guid.new.to_s
        hub.client_connected(client_id, self)
        padding_for_safari = " " * 256
        render(padding_for_safari + ["connected", client_id].to_json)
      end

      def register_disconnection
        hub.client_disconnected(client_id)
      end

      def hub
        env[RACK_ENV_KEY]
      end

      def params
        request.params
      end
    end
  end
end
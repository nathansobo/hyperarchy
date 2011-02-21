require 'cramp/controller'

module Monarch
  module Rack
    class RealTimeHub
      RACK_ENV_HUB_KEY = "real_time_hub"
      RACK_ENV_CLIENT_KEY = "real_time_client"

      attr_reader :app, :comet_handler, :clients, :clients_mutex
      def initialize(app)
        @app = app
        @comet_handler = CometHandler
        @clients = Hash.new { |clients, id| clients[id] = RealTimeClient.new(id, self) }
        @clients_mutex = Mutex.new
      end

      def call(env)
        request = ::Rack::Request.new(env)
        env[RACK_ENV_HUB_KEY] = self
        if client_id = request.params["real_time_client_id"]
          client = client(client_id)
          client.user = env["warden"].user if env["warden"]
          env[RACK_ENV_CLIENT_KEY] = client 
        end

        case request.path_info
          when "/comet"
            comet_handler.call(env)
          else
            app.call(env)
        end
      end

      def client_connected(client_id, connection)
        client(client_id).connection = connection
      end

      def client_disconnected(client_id)
        client(client_id).connection = nil
      end

      def remove_client(client_id)
        clients_mutex.synchronize do
          clients.delete(client_id)
        end
      end

      def client(client_id)
        clients_mutex.synchronize { clients[client_id] }
      end

      class CometHandler < Cramp::Controller::Action
        attr_reader :env, :client_id
        keep_connection_alive
        on_start :register_connection
        on_finish :register_disconnection

        def respond_with
          [200, {'Content-Type' => 'application/x-event-stream'}]
        end

        def register_connection
          @client_id = params["real_time_client_id"]
          unless client_id
            render "No real_time_client_id param provided with the request"
            finish
            return
          end
          hub.client_connected(client_id, self)
          padding_for_safari = " " * 256
          render(padding_for_safari + ["connected", client_id].to_json + "\n")
        end

        def register_disconnection
          hub.client_disconnected(client_id) if client_id
        end

        def hub
          env[RACK_ENV_HUB_KEY]
        end

        def params
          request.params
        end
      end
    end
  end
end
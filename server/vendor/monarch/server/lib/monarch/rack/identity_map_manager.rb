module Monarch
  module Rack
    class IdentityMapManager
      attr_reader :app

      def initialize(app)
        @app = app
      end

      def call(env)
        puts "id map"
        Model::Repository.initialize_local_identity_map
        result = app.call(env)
        Model::Repository.clear_local_identity_map
        result
      end
    end
  end
end



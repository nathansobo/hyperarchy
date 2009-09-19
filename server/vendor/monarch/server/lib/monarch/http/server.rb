class Benchmarker
  attr_reader :app
  def initialize(app)
    @app = app
  end

  def call(env)
    start = Time.now.to_i
    result = app.call(env)
    puts "#{Time.now.to_i - start} -- #{env['PATH_INFO']}"
    result
  end
end

module Http
  class Server
    class << self
      attr_reader :instance

      def start(options)
        @instance = new
        instance.start(options)
      end

      delegate :load_fixtures, :compile_public_assets, :to => :instance
    end

    def start(options)
      port = options.delete(:port) || 8080
      Thin::Server.start(port) do
#        use Benchmarker
        use Rack::ContentLength
        use Rack::ShowExceptions
        use AssetService, AssetManager.instance
        use SessioningService
        run Dispatcher.instance
      end
    end
  end
end

module Http
  class Server
    attr_reader :thin
    delegate :start, :stop, :to => :thin

    def initialize(resource_locator, options={})
      @thin = Thin::Server.new(options[:port] || 8080) do
        use Rack::ContentLength
        use Rack::ShowExceptions
        use AssetService, Util::AssetManager.instance
        use SessioningService
        run Dispatcher.new(resource_locator)
      end
    end
  end
end

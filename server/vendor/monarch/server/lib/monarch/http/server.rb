module Http
  class Server
    attr_reader :thin
    delegate :start, :stop, :to => :thin

    def initialize(options={})
      @thin = Thin::Server.new(options.delete(:port) || 8080) do
        use Rack::ContentLength
        use Rack::ShowExceptions
        use AssetService, Util::AssetManager.instance
        use SessioningService
        run Dispatcher.instance
      end
    end
  end
end

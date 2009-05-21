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
      use Rack::Static, :urls => ["/javascript", "/stylesheets"], :root => "#{ROOT}/public"
      use Rack::ContentLength
      use Rack::ShowExceptions
      run Dispatcher.instance
    end
  end
end
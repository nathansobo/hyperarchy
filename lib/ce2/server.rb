class Server
  def self.start(options)
    new.start(options)
  end

  def start(options)
    port = options.delete(:port) || 8080
    Thin::Server.start(port) do
      run Dispatcher.instance
    end
  end
end
module Http
  class CometClient
    attr_reader :id, :hub
    attr_accessor :transport

    def initialize(id, transport, hub)
      @id, @transport, @hub = id, transport, hub
    end

    def send(message)
      transport.write(message) if transport
    end
  end
end
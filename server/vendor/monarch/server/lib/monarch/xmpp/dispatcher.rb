module Xmpp
  class Dispatcher
    attr_reader :connection

    def initialize
      @connection = Jabber::Component.new("application@hyperarchy.org")
    end

    def start
      connection.connect('localhost', 8888)
      connection.auth('secret')
      connection.add_presence_callback { |stanza| handle_presence(stanza) }
      connection.start
    end

    def stop
      connection.stop
    end

    protected
    def handle_presence(stanza)
      client = Client.create(:jid => stanza.from.to_s, :session_id => stanza.attribute("session_id").value)
      client.activate
    end
  end
end
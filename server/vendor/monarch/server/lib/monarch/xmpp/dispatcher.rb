module Xmpp
  class Dispatcher
    attr_reader :connection

    def initialize
      @connection = Jabber::Component.new("application@hyperarchy.org")
    end

    def start
      connection.connect('localhost', 8888)
      connection.auth('secret')

      connection.add_presence_callback do |presence|
        p presence
      end
      connection.add_xml_callback do |stanza|
        p stanza
      end
      connection.start
    end

    def stop
      connection.stop
    end

  end
end
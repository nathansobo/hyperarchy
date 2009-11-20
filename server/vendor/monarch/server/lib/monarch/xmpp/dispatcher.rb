module Xmpp
  class Dispatcher
    include Blather::DSL

    attr_reader :resource_locator, :connection

    def initialize(resource_locator)
      @resource_locator = resource_locator
      setup("application.hyperarchy.org", "component", "localhost", 5275)
    end

    def send(stanza)
      client.write(stanza)
    end

    def start
      status :available? do |stanza|
        puts stanza.to_s
        client_came_online(stanza.from, stanza['session_id'])
      end

      status :unavailable? do |stanza|
        puts "unavailable!!!!"
        puts stanza.to_s
        client_went_offline(stanza.from)
      end

      iq do |stanza|
        puts stanza.to_s
        p stanza.find("/iq/subscribe")
      end

      client.run
    end

    def stop
      client.stop
    end

    protected

    def client_came_online(jid, session_id)
      client = Client.create(:jid => jid.to_s, :session_id => session_id)
      client.activate
      say(jid, "Hi there!!!!!!")
    end

    def client_went_offline(jid)
      client = client_for_jid(jid)
      client.destroy if client
    end

    def handle_iq(stanza)
      puts "IQ #{stanza}"
      Model::Repository.with_local_identity_map do
        return unless stanza.to.resource
        
        resource = resource_locator.locate(stanza.to.resource, :client => client_for_jid(stanza.from))
        method_element = stanza.children.first
        method_name = method_element.name
        return unless resource.public_methods.include?(method_name)

        method_params = {}
        method_element.attributes.each_attribute do |attribute|
          method_params[attribute.name.to_sym] = attribute.value
        end

        result = resource.send(method_name, method_params)

        reply = Jabber::Iq.new(:result)
        reply.id = stanza.id
        response_element = REXML::Element.new
        response_element.text = result
        reply.add_element(response_element)
        
        send(reply)
      end
    end


    def send(stanza)
      puts "SENDING #{stanza}"
      connection.send(stanza)
    end

    def client_for_jid(jid)
      Client.find(Client[:jid].eq(jid.to_s))
    end
  end
end
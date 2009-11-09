module Xmpp
  class Dispatcher
    attr_reader :resource_locator, :connection

    def initialize(resource_locator)
      @resource_locator = resource_locator
      @connection = Jabber::Component.new("application@hyperarchy.org")
    end

    def start
      connection.connect('localhost', 8888)
      connection.auth('secret')
      connection.add_presence_callback { |stanza| handle_presence(stanza) }
      connection.add_iq_callback { |stanza| handle_iq(stanza) }
      connection.start
    end

    def stop
      connection.stop
    end

    protected
    def handle_presence(stanza)
      with_thread_local_identity_map do
        if stanza.type == :unavailable
          client_went_offline(stanza.from)
        else
          client_came_online(stanza.from, stanza.attribute("session_id").value)
        end
      end
    end

    def handle_iq(stanza)
      with_thread_local_identity_map do
        resource = resource_locator.locate(stanza.to.resource, :client => client_for_jid(stanza.from))
        method_element = stanza.children.first
        method_name = method_element.name
        return unless resource.public_methods.include?(method_name)

        method_params = {}
        method_element.attributes.each_attribute do |attribute|
          method_params[attribute.name.to_sym] = attribute.value
        end

        resource.send(method_name, method_params)
      end
    end

    def client_came_online(jid, session_id)
      client = Client.create(:jid => jid.to_s, :session_id => session_id)
      client.activate
    end

    def client_went_offline(jid)
      client_for_jid(jid).destroy
    end

    def client_for_jid(jid)
      Client.find(Client[:jid].eq(jid.to_s))
    end
    
    def with_thread_local_identity_map()
      Model::Repository.initialize_identity_maps
      yield
    rescue
      Model::Repository.clear_identity_maps
    end
  end
end
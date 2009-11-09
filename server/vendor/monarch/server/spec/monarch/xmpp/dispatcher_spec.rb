require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Xmpp
  describe Dispatcher do
    attr_reader :resource_locator, :dispatcher
    before do
      @resource_locator = Util::ResourceLocator.new
      @dispatcher = Xmpp::Dispatcher.new(resource_locator)
    end
    
    describe "#handle_presence(presense_stanza)" do
      before do
        publicize dispatcher, :handle_presence
      end

      it "creates a Client object with the jid and session_id attributes from the stanza and adds it to the persistent identity map, then destroys it when the client becomes unavailable" do
        stanza = Jabber::Presence.new
        stanza.from = "12345@hyperarchy.org/r12345"
        stanza.to = "app.hyperarchy.org"
        stanza.add_attribute("session_id", "fake-session-id")

        dispatcher.handle_presence(stanza)

        client = Client.find(Client[:session_id].eq("fake-session-id").and(Client[:jid].eq("12345@hyperarchy.org/r12345")))
        client.should_not be_nil

        Model::Repository.clear_identity_maps
        Client.find(client.id).should == client

        unavailable_stanza = Jabber::Presence.new
        unavailable_stanza.from = "12345@hyperarchy.org/r12345"
        unavailable_stanza.to = "app.hyperarchy.org"
        unavailable_stanza.type = :unavailable

        dispatcher.handle_presence(unavailable_stanza)

        Client.find(client.id).should be_nil
      end
    end

#
#    relations = [
#      { 'type' => "table", 'name' => "blogs" },
#      { 'type' => "table", 'name' => "blog_posts" }
#    ].to_json
#
#    subscribe_element = REXML::Element.new("subscribe")
#    subscribe_element.add_attribute("relations", relations)
#    subscribe_element.add_attribute("fetch", true)
#
#    iq.add_element


    describe "#handle_iq(iq_stanza)" do
      attr_reader :jid, :client

      before do
        publicize dispatcher, :client_came_online, :handle_iq

        @jid = "12345@hyperarchy.org/r12345"
        dispatcher.client_came_online(jid, "sample-session-id")
        @client = Client.find(Client[:jid].eq(jid))
      end

      it "locates the resource indicated in the path following the 'to' attribute and calls the method indicated by the name of the iq's child tag with a hash of its attribute values" do
        iq_stanza = Jabber::Iq.new(:put, "app.hyperarchy.org/res/our/ce")
        iq_stanza.from = jid
        iq_stanza.id = "sample-iq-id"
        method_element = REXML::Element.new("foo")
        method_element.add_attribute("foo", "bar")
        method_element.add_attribute("baz", "quux")
        iq_stanza.add_element(method_element)

        resource = Class.new do
          public
          def foo(params)
          end

          protected
          def bar(params)
            raise "non-public methods should not be called"
          end
        end.new

        mock(resource_locator).locate("res/our/ce", { :client => client }) { resource }.twice
        mock(resource).foo({ :foo => "bar", :baz => "quux" }).once

        dispatcher.handle_iq(iq_stanza)

        # should not attempt to call a protected method
        method_element.name = "bar"
        dispatcher.handle_iq(iq_stanza)
      end
    end
  end
end
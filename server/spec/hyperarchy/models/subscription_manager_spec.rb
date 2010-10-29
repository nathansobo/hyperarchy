require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe SubscriptionManager do
  include Monarch::Rack

  it "sends an event to the subscribed clients of the appropriate organizations whenever model objects are modified" do
    hub = Object.new
    client_1 = RealTimeClient.new("client_1", hub)
    client_2 = RealTimeClient.new("client_2", hub)

    org_1 = Organization.make
    org_2 = Organization.make

    SubscriptionManager.subscribe_to_organization(client_1, org_1.id)
    SubscriptionManager.subscribe_to_organization(client_2, org_2.id)
    SubscriptionManager.subscribe_to_organization(client_1, org_2.id)

    mock(client_1).send(["update", "organizations", org_1.id, {"name" => "Kids Incorporated"}])
    org_1.update(:name => "Kids Incorporated")
  end
end
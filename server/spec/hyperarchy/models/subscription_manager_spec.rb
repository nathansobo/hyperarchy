require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe SubscriptionManager do
  include Monarch::Rack

  it "sends an event to the subscribed clients of the appropriate organizations whenever model objects are modified" do
    hub = Object.new
    client_1 = RealTimeClient.new("client_1", hub)
    client_2 = RealTimeClient.new("client_2", hub)

    org_1 = Organization.make
    org_2 = Organization.make

    user_1 = User.make
    user_2 = User.make

    Membership.make(:user => user_1, :organization => org_1)
    Membership.make(:user => user_2, :organization => org_1)
    Membership.make(:user => user_1, :organization => org_2)

    SubscriptionManager.subscribe_to_organization(client_1, org_1.id)
    SubscriptionManager.subscribe_to_organization(client_2, org_2.id)
    SubscriptionManager.subscribe_to_organization(client_1, org_2.id)

    mock(client_1).send(["update", "organizations", org_1.id, {"name" => "Kids Incorporated"}])
    org_1.update!(:name => "Kids Incorporated")

    org_2_update = ["update", "organizations", org_2.id, {"name" => "Evil Empire"}]
    mock(client_1).send(org_2_update)
    mock(client_2).send(org_2_update)
    org_2.update!(:name => "Evil Empire")

    user_1_update = ["update", "users", user_1.id, {"first_name" => "Shrew"}]
    mock(client_1).send(user_1_update).twice
    mock(client_2).send(user_1_update)
    user_1.update!(:first_name => "Shrew")

    create_message = nil
    mock(client_1).send(anything) do |message|
      create_message = message
    end
    election = org_1.elections.create!(:body => "What's your name?")
    create_message[0].should == "create"
    create_message[1].should == "elections"
    create_message[2].should == election.wire_representation
  end
end
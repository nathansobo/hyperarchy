require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /subscribe_to_organization/:id", :type => :rack do
  attr_reader :organization, :current_user
  before do
    @organization = Organization.make
    @current_user = login_as(User.make)
  end

  it "via the SubscriptionManager, subscribes to the requested organization id with the current real time client" do
    Membership.make(:organization => organization, :user => current_user)
    mock(SubscriptionManager).subscribe_to_organization(is_a(Monarch::Rack::RealTimeClient), organization)
    post "/subscribe_to_organization/#{organization.id}", :real_time_client_id => "fake-client-id"
  end
end
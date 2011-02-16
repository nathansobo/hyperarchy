require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "GET /fetch_election_data", :type => :rack do
  context "if the organization is public readable" do
    it "allows anyone to fetch data" do
      org = Organization.make(:privacy => "read_only")
      guest = User.make(:guest => true)
      login_as(guest)

      get "/fetch_election_data", :organization_id => org.id
      last_response.should be_ok
    end
  end

  context "if the organization is private" do
    it "only allows the members to fetch data" do
      org = Organization.make(:privacy => "private")
      guest = User.make(:guest => true)
      member = make_member(org)

      login_as(guest)
      get "/fetch_election_data", :organization_id => org.id
      last_response.status.should == 401

      login_as(member)
      get "/fetch_election_data", :organization_id => org.id
      last_response.should be_ok
    end
  end
end
require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "GET /autocomplete_members", :type => :rack do
  before do
    login_as User.make
  end

  it "returns a list of user names and email addresses that match the given string" do



    post "/invite", :email_addresses => ["nathan@example.com", "stephanie@example.com"].to_json
    last_response.should be_ok
    Invitation.find(:sent_to_address => "nathan@example.com").should_not be_nil
    Invitation.find(:sent_to_address => "stephanie@example.com").should_not be_nil
  end
end

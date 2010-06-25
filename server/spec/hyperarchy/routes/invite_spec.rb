require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /invite", :type => :rack do
  before do
    login_as User.make
  end


  it "creates an invitation for each of the given email addresses" do


    post "/invite", :email_addresses => ["nathan@example.com", "stephanie@example.com"].to_json
    last_response.should be_ok
    Invitation.find(:sent_to_address => "nathan@example.com").should_not be_nil
    Invitation.find(:sent_to_address => "stephanie@example.com").should_not be_nil
  end
end

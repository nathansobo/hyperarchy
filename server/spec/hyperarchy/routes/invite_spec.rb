require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /invite", :type => :rack do
  before do
    login_as User.make
  end

  it "creates an invitation for each of the given email addresses, unless one already exists" do
    Invitation.create!(:sent_to_address => "duplicate@example.com")

    post "/invite", :email_addresses => ["nathan@example.com", "stephanie@example.com", "duplicate@example.com"].to_json
    last_response.should be_ok

    last_response.body_from_json["data"]["rejected"].should == ["duplicate@example.com"]

    Invitation.find(:sent_to_address => "nathan@example.com").should_not be_nil
    Invitation.find(:sent_to_address => "stephanie@example.com").should_not be_nil

    Invitation.where(:sent_to_address => "duplicate@example.com").size.should == 1
  end
end

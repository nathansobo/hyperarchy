require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /mailing_list_signup", :type => :rack do
  it "creates an entry in the mailing_lists table" do
    DB = Sequel::DATABASES.first
    DB[:mailing_list_entries].should be_empty

    Timecop.freeze
    post "/mailing_list_signup", :email_address => "foo@bar.com", :comments => "i'm interested"

    entry = DB[:mailing_list_entries].first

    entry[:email_address].should == "foo@bar.com"
    entry[:comments].should == "i'm interested"
    entry[:created_at].to_i.should == Time.now.to_i

    last_response.should be_ok
    last_response.body.should include("Thank you")
  end
end
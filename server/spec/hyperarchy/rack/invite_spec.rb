require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /invite", :type => :rack do
  before do
    login_as User.find('nathan')
  end

  it "creates an invitation for each of the given email addresses and sends an email matched to its guid" do
    emails = []
    mock(Pony).mail.twice do |options|
      emails.push(options)
    end

    post "/invite", :email_addresses => ["nathan@example.com", "stephanie@example.com"].to_json
    last_response.should be_ok
    
  end

end

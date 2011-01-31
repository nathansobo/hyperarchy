require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /request_password_reset", :type => :rack do

  before do
    @election = Election.make(:body => "Who should win?")
    @c1 = election.candidates.create!(:body => "c1")
    @c2 = election.candidates.create!(:body => "c2")
    @member = make_member(election.organization)
    @non_member = User.make
  end

  it "sets a password reset token on the user with the given email address and emails it to them" do


    post "/request_password_reset"

  end
end

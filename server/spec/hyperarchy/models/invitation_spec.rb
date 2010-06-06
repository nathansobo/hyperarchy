require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Invitation do
    attr_reader :emails, :inviter, :invitation
    use_fixtures

    before do
      @emails = []
      @inviter = User.find("nathan")
      @invitation = Invitation.create!(:inviter => inviter, :sent_to_address => "bob@example.com")
    end

    describe "before create" do
      it "assigns a guid to the invitation" do
        invitation.guid.should_not be_nil
      end
    end

    describe "after create" do
      it "sends an email to the :sent_to_address" do
        Mailer.emails.length.should == 1

        email = Mailer.emails.first
        email[:to].should == "bob@example.com"
        email[:subject].should match(Regexp.new(inviter.full_name))
        email[:body].should include("hyperarchy.com/signup?invitation_code=#{invitation.guid}")
      end
    end

    describe "#redeem" do
      it "if not already redeemed, creates and returns a user with the given properties, otherwise raises" do
        invitation.should_not be_redeemed
        user = invitation.redeem(:first_name => "Chevy", :last_name => "Chase", :email_address => "chevy@example.com", :password => "password")
        invitation.should be_redeemed
        invitation.invitee.should == user

        user.should_not be_dirty
        user.full_name.should == "Chevy Chase"
        user.email_address.should == "chevy@example.com"

        lambda do
          invitation.redeem(:full_name => "Chevy Chase", :email_address => "chevy@example.com", :password => "password")
        end.should raise_error
      end
    end
  end
end

require 'spec_helper'

module Models
  describe Invitation do
    attr_reader :emails, :inviter, :invitation

    before do
      @emails = []
      @inviter = User.make
      @invitation = Invitation.create!(:inviter => inviter, :sent_to_address => "bob@example.com", :send_email => send_email)
    end

    def send_email
      false
    end

    describe "before create" do
      it "assigns a guid to the invitation" do
        invitation.guid.should_not be_nil
      end
    end

    describe "after create" do
      context "when :send_email is true" do
        def send_email
          true
        end

        it "sends an email to the :sent_to_address" do
          Mailer.emails.length.should == 1

          email = Mailer.emails.first
          email[:to].should == "bob@example.com"
          email[:subject].should match(Regexp.new(inviter.full_name))
          email[:body].should include("hyperarchy.com/signup?invitation_code=#{invitation.guid}")
        end
      end

      context "when :send_email is false" do
        it "does not send any email" do
          Mailer.emails.should be_empty
        end
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

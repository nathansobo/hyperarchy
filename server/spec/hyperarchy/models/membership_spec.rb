require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Membership do
    attr_reader :organization, :current_user
    before do
      @organization = Organization.make
      @current_user = User.make
      Monarch::Model::Record.current_user = current_user
    end

    describe "when not pending" do
      it "does not send a confirmation email" do
        organization.memberships.create!(:user => User.make, :pending => false)
        Mailer.emails.should be_empty
      end
    end

    describe "when created with an email address of an existing user" do
      it "associates the pending membership with the user that has that email address and sends them an email with a link to join the organization" do
        user = User.make
        membership = organization.memberships.create!(:email_address => user.email_address)
        membership.user.should == user
        membership.should be_pending
        membership.invitation.should be_nil

        Mailer.emails.length.should == 1
        invite_email = Mailer.emails.first

        invite_email[:to].should == user.email_address
        invite_email[:subject].should match(/#{current_user.full_name}/)
        invite_email[:subject].should match(/#{organization.name}/)
        invite_email[:body].should match(/confirm_membership\/#{membership.id}/)
      end
    end

    describe "when created with an unknown email address" do
      it "associates the pending membership with an invitation with the given email address and sends them an email with a link to the invitation" do
        first_name = "New"
        last_name = "Member"

        email_address = "new_member@example.com"

        membership_1 = organization.memberships.create!(:first_name => first_name, :last_name => last_name, :email_address => email_address)
        membership_1.should be_pending

        invitation = membership_1.invitation
        invitation.inviter.should == current_user
        invitation.first_name.should == first_name
        invitation.last_name.should == last_name
        invitation.sent_to_address.should == email_address
        membership_1.user.should be_nil

        Mailer.emails.length.should == 1
        invite_email_1 = Mailer.emails.shift
        invite_email_1[:to].should == email_address
        invite_email_1[:subject].should include(current_user.full_name)
        invite_email_1[:subject].should include(organization.name)
        invite_email_1[:body].should match(/signup\?invitation_code=#{invitation.guid}/)

        # Membership to a different organization associtates with the same invitation
        organization_2 = Organization.make
        membership_2 = organization_2.memberships.create!(:email_address => email_address)

        membership_2.should be_pending
        membership_2.invitation.should == invitation

        Mailer.emails.length.should == 1
        invite_email_2 = Mailer.emails.shift
        invite_email_2[:to].should == email_address
        invite_email_2[:subject].should include(current_user.full_name)
        invite_email_2[:subject].should include(organization_2.name)
        invite_email_2[:body].should match(/signup\?invitation_code=#{invitation.guid}/)

        # A third membership just to test redemption below
        organization_3 = Organization.make
        membership_3 = organization_3.memberships.create!(:email_address => email_address)

        # Become a member only of the specified organizations, delete the other memberships
        user = invitation.redeem(:user => User.plan, :confirm_memberships => [membership_1.id, membership_3.id])
        membership_1.should_not be_pending
        membership_1.user.should == user
        membership_3.should_not be_pending
        membership_3.user.should == user
        Membership.find(membership_2.id).should be_nil
      end
    end
  end
end

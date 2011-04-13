require "spec_helper"

describe MembershipMailer do

  describe "#invitation" do
    attr_reader :organization, :membership, :invitation, :email

    before do
      @organization = Organization.make
      set_current_user(make_member(organization))
      @membership = organization.memberships.make(
        :first_name => "John",
        :last_name => "Doe",
        :email_address => "johndoe@example.com"
      )
      @invitation = membership.invitation

      @email = MembershipMailer.invitation(membership.id).deliver
      ActionMailer::Base.deliveries.should_not be_empty
    end

    it "is from admin@hyperarchy.com, to the address specified in the invitation" do
      email.from.should == ["admin@hyperarchy.com"]
      email.to.should == [invitation.sent_to_address]
    end

    it "mentions the sender's name and organization in the subject" do
      email.subject.should include(current_user.full_name)
      email.subject.should include(organization.name)
    end

    it "includes a link to the signup page with an invitation parameter in both the html and plain-text portions of the email" do
      email.text_part.body.should include(signup_url(:invitation_code => invitation.guid))
      email.html_part.body.should include(signup_url(:invitation_code => invitation.guid))
    end
  end

  describe "#existing_user_notification" do
    attr_reader :organization, :membership, :invitation, :email

    before do
      user = User.make
      @organization = Organization.make
      set_current_user(make_member(organization))
      @membership = organization.memberships.make(
        :first_name => user.first_name,
        :last_name => user.last_name,
        :email_address => user.email_address
      )
      membership.user.should == user

      @email = MembershipMailer.existing_user_notification(current_user.id, membership.id).deliver
      ActionMailer::Base.deliveries.should_not be_empty
    end

    it "is from admin@hyperarchy.com, to the user that was added as a member" do
      email.from.should == ["admin@hyperarchy.com"]
      email.to.should == [membership.email_address]
    end

    it "mentions the sender's name and organization in the subject" do
      email.subject.should include(current_user.full_name)
      email.subject.should include(organization.name)
    end

    it "includes a link to the organization in the signup page" do
      pending
      email.text_part.body.should include(home_url)
      email.html_part.body.should include(signup_url)
    end
  end
end

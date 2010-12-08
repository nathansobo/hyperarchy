require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /invite", :type => :rack do
  attr_reader :organization_1, :organization_2, :owner, :member

  before do
    @organization_1 = Organization.make(:members_can_invite => false)
    @owner = make_owner(organization_1)
    @member = make_member(organization_1)

    @organization_2 = Organization.make(:members_can_invite => true)
    organization_2.memberships.create!(:user => member, :role => "member", :suppress_invite_email => true)
    organization_2.memberships.create!(:user => owner, :role => "member", :suppress_invite_email => true)
    organization_1.memberships.create!(:email_address => "existing@example.com", :suppress_invite_email => true)

    login_as owner
  end

  it "creates a pending membership for each of the requested organizations" do
    login_as owner

    email_addresses = "nathan@example.com, stephanie@example.com, existing@example.com, #{member.email_address}"
    post "/invite", :email_addresses => email_addresses, :organization_ids => [organization_1.id, organization_2.id].to_json
    last_response.should be_ok

    # we don't have more than 1 membership associated with an email address / organization pair
    email_addresses_1 = organization_1.memberships.map(&:email_address)
    email_addresses_1.uniq.should == email_addresses_1
    email_addresses_1.should include("nathan@example.com")
    email_addresses_1.should include("stephanie@example.com")
    email_addresses_1.should include("existing@example.com")

    email_addresses_2 = organization_2.memberships.map(&:email_address)
    email_addresses_2.uniq.should == email_addresses_2
    email_addresses_2.should include("nathan@example.com")
    email_addresses_2.should include("stephanie@example.com")
    email_addresses_2.should include("existing@example.com")

    Invitation.where(:sent_to_address => "nathan@example.com").size.should == 1
    Invitation.where(:sent_to_address => "stephanie@example.com").size.should == 1
    Invitation.where(:sent_to_address => "existing@example.com").size.should == 1
    Invitation.where(:sent_to_address => member.email_address).should be_empty
  end

  it "does not allow the user to invite to organizations they do not own if they don't have member invites enabled" do
    login_as member
    dont_allow(Membership).create
    dont_allow(Membership).create!

    post "/invite", :email_addresses => "foo@example.com", :organization_ids => [organization_1.id, organization_2.id].to_json

    last_response.status.should == 401
  end
end

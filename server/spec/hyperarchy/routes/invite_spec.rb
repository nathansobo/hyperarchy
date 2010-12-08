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
    login_as owner
  end

  it "creates a pending membership for each of the requested organizations" do
    login_as owner

    duplicate_invitation = Invitation.create!(:sent_to_address => "duplicate@example.com")

    email_addresses = "nathan@example.com, stephanie@example.com, duplicate@example.com"
    post "/invite", :email_addresses => email_addresses, :organization_ids => [organization_1.id, organization_2.id].to_json
    last_response.should be_ok

    nathan_invitation = Invitation.find(:sent_to_address => "nathan@example.com")
    stephanie_invitation = Invitation.find(:sent_to_address => "stephanie@example.com")

    nathan_invitation.should_not be_nil
    stephanie_invitation.should_not be_nil

    nathan_membership_1 = organization_1.memberships.find(:pending => true, :invitation_id => nathan_invitation.id)
    stephanie_membership_1 = organization_1.memberships.find(:pending => true, :invitation_id => stephanie_invitation.id)
    duplicate_membership_1 = organization_1.memberships.find(:pending => true, :invitation_id => duplicate_invitation.id)
    nathan_membership_2 = organization_2.memberships.find(:pending => true, :invitation_id => nathan_invitation.id)
    stephanie_membership_2 = organization_2.memberships.find(:pending => true, :invitation_id => stephanie_invitation.id)
    duplicate_membership_2 = organization_2.memberships.find(:pending => true, :invitation_id => duplicate_invitation.id)

    nathan_membership_1.should_not be_nil
    stephanie_membership_1.should_not be_nil
    duplicate_membership_1.should_not be_nil
    nathan_membership_2.should_not be_nil
    stephanie_membership_2.should_not be_nil
    duplicate_membership_2.should_not be_nil

    memberships_dataset = last_response.body_from_json["dataset"]["memberships"]
    memberships_dataset.should have_key(nathan_membership_1.id.to_s)
    memberships_dataset.should have_key(stephanie_membership_1.id.to_s)
    memberships_dataset.should have_key(duplicate_membership_1.id.to_s)
    memberships_dataset.should have_key(nathan_membership_2.id.to_s)
    memberships_dataset.should have_key(stephanie_membership_2.id.to_s)
    memberships_dataset.should have_key(duplicate_membership_2.id.to_s)

    Invitation.where(:sent_to_address => "duplicate@example.com").size.should == 1
  end

  it "does not allow the user to invite to organizations they do not own if they don't have member invites enabled" do
    login_as member
    dont_allow(Membership).create
    dont_allow(Membership).create!

    post "/invite", :email_addresses => "foo@example.com", :organization_ids => [organization_1.id, organization_2.id].to_json

    last_response.status.should == 401
  end
end

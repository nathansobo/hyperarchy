require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe Organization do
  describe "security" do
    describe "#can_create?" do
      it "does not allow guests to create" do
        organization = Organization.make_unsaved
        set_current_user(User.guest)
        organization.can_create?.should be_false

        set_current_user(User.make)
        organization.can_create?.should be_true
      end
    end

    describe "#can_update? and #can_destroy" do
      it "only allows admins and owners to update or destroy the organization" do
        organization = Organization.make
        non_member = User.make
        admin = User.make(:admin => true)
        member = make_member(organization)
        owner = make_owner(organization)

        set_current_user(non_member)
        organization.can_update?.should be_false
        organization.can_destroy?.should be_false

        set_current_user(member)
        organization.can_update?.should be_false
        organization.can_destroy?.should be_false

        set_current_user(owner)
        organization.can_update?.should be_true
        organization.can_destroy?.should be_true

        set_current_user(admin)
        organization.can_update?.should be_true
        organization.can_destroy?.should be_true
      end
    end

    describe "#before_create" do
      it "creates a secret code string for inviting new members" do
        organization = Organization.make
        organization.invitation_code.should_not be_nil
        organization.invitation_code.length.should >= 4
      end
    end

    describe "#after_create" do
      it "creates a special user who can view the organization as a guest" do
        organization = Organization.make
        organization.memberships.size.should == 1
        members_relation = organization.memberships.join_through(User)
        members_relation.size.should == 1
        members_relation.first.should be_guest
      end
    end
  end
end
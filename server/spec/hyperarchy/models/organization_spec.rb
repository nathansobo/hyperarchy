require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe Organization do
  describe "security" do
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
  end
end
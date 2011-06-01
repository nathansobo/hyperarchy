require 'spec_helper'

describe Organization do
  describe "security" do
    describe "#can_create?" do
      it "does not allow guests to create" do
        organization = Organization.make_unsaved
        set_current_user(User.default_guest)
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
        member = organization.make_member
        owner = organization.make_owner

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
      it "populates the #invitation_code with a random string" do
        organization = Organization.make
        organization.invitation_code.should_not be_nil
      end
    end

    describe "#after_create" do
      it "creates a special guest with a membership to the organization and to hyperarchy social" do
        organization = Organization.make
        special_guest = organization.guest
        special_guest.should_not be_nil
        special_guest.organizations.all.should =~ [organization, Organization.social]
      end
    end

    describe "#ensure_current_user_is_member" do
      attr_reader :organization

      context "if the organization is public" do
        before do
          @organization = Organization.make(:privacy => 'public')
        end

        context "if the current user is not a member" do
          before do
            set_current_user(User.make)
          end

          it "creates a membership for them" do
            current_user.memberships.where(:organization => organization).should be_empty
            organization.ensure_current_user_is_member
            current_user.memberships.where(:organization => organization).count.should == 1
          end
        end

        context "if the current user is a member" do
          before do
            set_current_user(organization.make_member)
          end

          it "does not create another membership for them" do
            expect do
              organization.ensure_current_user_is_member
            end.to_not change { current_user.memberships.where(:organization => organization).count }
          end
        end
      end

      context "if the organization is not public" do
        before do
          @organization = Organization.make(:privacy => 'private')
        end

        context "if the current user is a confirmed member" do
          before do
            set_current_user(organization.make_member)
          end

          it "does not raise an exception" do
            organization.ensure_current_user_is_member
          end
        end

        context "if the current user is not a member" do
          before do
            set_current_user(User.make)
          end

          it "raises a security exception" do
            expect do
              organization.ensure_current_user_is_member
            end.to raise_error(SecurityError)
          end
        end
      end
    end
  end
end

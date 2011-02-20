require 'spec_helper'

module Models
  describe User do
    attr_reader :user
    before do
      @user = User.make
    end

    describe "#validate" do
      it "ensures first_name, last_name, email_address, and encrypted_password are present" do
        User.make_unsaved(:first_name => "").should_not be_valid
        User.make_unsaved(:last_name => "").should_not be_valid
        User.make_unsaved(:email_address => "").should_not be_valid
        User.make_unsaved(:password => "").should_not be_valid
      end

      it "ensures the email address is unique" do
        user.should be_valid
        User.make_unsaved(:email_address => user.email_address).should_not be_valid
      end
    end

    describe "#after_create" do
      it "if on production, sends admin an email about the new user" do
        with_rails_env("production") do
          Mailer.emails.clear
          User.create!(:first_name => "Steph", :last_name => "Wamby", :email_address => "wamby@example.com", :password => "password")
          Mailer.emails.length.should == 1
          Mailer.emails.first[:to].should == "nathan@hyperarchy.com"
        end
      end
    end

    describe "#password and #password=" do
      specify "#password= assigns #encrypted_password such that #password returns a BCrypt::Password object that will be == to the assigned unencrypted password" do
        user.password = "password"
        user.encrypted_password.should_not be_nil
        user.password.should == "password"
        user.password.should_not == "foo"
      end
    end

    describe "#generate_password_reset_token" do
      it "sets the password reset token to a random string and also sets the password reset timestamp" do
        freeze_time

        user.password_reset_token.should be_nil
        user.password_reset_token_generated_at.should be_nil
        user.generate_password_reset_token
        user.password_reset_token.should_not be_nil
        user.password_reset_token_generated_at.should == Time.now
      end
    end

    describe "#initial_repository_contents" do
      attr_reader :org_1, :org_2, :org_3

      before do
        @org_1 = Organization.make(:privacy => "public")
        @org_2 = Organization.make(:privacy => "read_only")
        @org_3 = Organization.make(:privacy => "private")
      end

      context "if the user is a member" do
        attr_reader :member, :contents, :org_4, :membership_1, :membership_2

        before do
          @org_4 = Organization.make(:privacy => "private")

          @member = User.make
          @membership_1 = member.memberships.make(:organization => org_1)
          @membership_2 = member.memberships.make(:organization => org_3)
          @contents = member.initial_repository_contents
        end

        it "includes the member's user model, their memberships, all non-private organizations, and all private organizations that the user is a member of" do
          contents.should include(member)
          contents.should include(membership_1)
          contents.should include(membership_2)
          contents.should include(org_1)
          contents.should include(org_2)
          contents.should include(org_3)
          contents.should_not include(org_4)
        end
      end

      context "if the user is an admin" do
        attr_reader :admin, :contents, :membership

        before do
          @admin = User.make(:admin => true)
          @membership = admin.memberships.make(:organization => org_1)
          @contents = admin.initial_repository_contents
        end

        it "includes the admin's user model, memberships, and all organizations" do
          contents.should include(admin)
          contents.should include(membership)
          contents.should include(org_1)
          contents.should include(org_2)
          contents.should include(org_3)
        end
      end

      context "if the user is a guest" do
        attr_reader :guest, :contents

        before do
          @guest = User.make(:guest => true)
          @contents = guest.initial_repository_contents
        end

        it "includes the guest user model and all non-private organizations" do
          contents.should include(guest)
          contents.should include(org_1)
          contents.should include(org_2)
          contents.should_not include(org_3)
        end
      end
    end

    describe "#default_organization" do
      context "when the user has memberships" do
        it "returns their last visited organization" do
          organization_1 = Organization.make
          organization_2 = Organization.make
          user = User.make
          user.memberships.make(:organization => organization_1, :created_at => 3.hours.ago)
          user.memberships.make(:organization => organization_2, :created_at => 1.hour.ago)

          user.default_organization.should == organization_2
        end
      end

      context "when the user has no memberships" do
        it "returns the social organization" do
          guest = User.make
          guest.memberships.should be_empty
          guest.default_organization.should == Organization.find(:social => true)
        end
      end
    end

    describe "security" do
      describe "#can_update? and #can_destroy?" do
        it "only allows admins and the users themselves to update / destroy user records, and only allows admins to set the admin flag" do
          user = User.make
          admin = User.make(:admin => true)
          other_user = User.make

          set_current_user(other_user)
          user.can_update?.should be_false
          user.can_destroy?.should be_false

          set_current_user(admin)
          user.can_update?.should be_true
          user.can_destroy?.should be_true
          user.can_update_columns?([:admin]).should be_true

          set_current_user(user)
          user.can_update?.should be_true
          user.can_destroy?.should be_true
          user.can_update_columns?([:admin]).should be_false
        end
      end
    end
  end
end
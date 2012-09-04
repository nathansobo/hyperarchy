require 'spec_helper'

module Models
  describe User do
    let(:user) { User.make }

    describe ".default_guest" do
      it "returns the default guest" do
        User.default_guest.should be_default_guest
      end
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

      it "allows there to be no encrypted_password if there is a facebook_id" do
        User.make_unsaved(:password => "", :facebook_id => "uid").should be_valid
      end

      it "allows there to be no encrypted_password, last_name, or email_address if there is a twitter_id" do
        User.make_unsaved(:password => nil, :last_name => nil, :email_address => nil, :twitter_id => 1969).should be_valid
      end
    end

    describe "#after_create" do
      it "if on production, sends admin an email about the new user" do
        user = expect_delivery { User.make }
        last_delivery.to.map(&:to_s).should =~ ["max@hyperarchy.com", "nathan@hyperarchy.com"]
        last_delivery.body.should include(user.full_name)
        last_delivery.body.should include(user.email_address)
      end

      it "makes the new user a member of social" do
        user = User.make
        user.organizations.all.should == [Organization.social]
        user.memberships.first.tap do |m|
          m.role.should == 'member'
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
    end

    describe "#guest_organization" do
      context "if the user is a special guest" do
        it "returns the organization they are a guest of" do
          org = Organization.make
          org.guest.guest_organization.should == org
        end
      end

      context "if the user is the default guest" do
        it "returns nil" do
          User.default_guest.guest_organization.should be_nil
        end
      end

      context "if the user is a normal user" do
        it "returns nil" do
          User.make.guest_organization.should be_nil
        end
      end
    end

    describe "#email_hash" do
      it "returns nil if email_address is nil" do
        user.update!(:twitter_id => 123, :email_address => nil)
        user.email_hash.should be_nil
      end
    end

    describe "methods supporting notifications" do
      describe ".users_to_notify(period)" do
        it "returns those non-guest users who have at least one membership with a notification preference matching the job's period and who have emails enabled" do
          m1 = make_membership('hourly', 'never', 'never', 'never')
          m2 = make_membership('never', 'hourly', 'never', 'never')
          m3 = make_membership('never', 'never', 'hourly', 'never')
          m4 = make_membership('never', 'never', 'never', 'hourly')
          m4b = make_membership('never', 'never', 'never', 'hourly', :user => m4.user) # ensure distinct users
          guest_m = make_membership('hourly', 'never', 'never', 'never')
          guest_m.user.update!(:guest => true)
          disabled_m = make_membership('hourly', 'never', 'never', 'never')
          disabled_m.user.update!(:email_enabled => false)
          
          make_membership('never', 'never', 'never', 'never')

          User.users_to_notify('hourly').all.map(&:id).should =~ [m1, m2, m3, m4].map(&:user).map(&:id)
        end

        def make_membership(questions, answers, comments_on_ranked, comments_on_own, additional_attrs = {})
          Membership.make(additional_attrs.merge(
            :notify_of_new_questions => questions,
            :notify_of_new_answers => answers,
            :notify_of_new_comments_on_own_answers => comments_on_ranked,
            :notify_of_new_comments_on_ranked_answers => comments_on_own
          ))
        end

        describe "#memberships_to_notify(period)" do
          it "returns those memberships with at least one notification preference set to the given period, with social memberships first" do
            social_membership = user.memberships.first
            social_membership.update(:notify_of_new_answers => 'hourly')

            m1 = make_membership('hourly', 'never', 'never', 'never')
            m2 = make_membership('never', 'hourly', 'never', 'never')
            m3 = make_membership('never', 'never', 'hourly', 'never')
            m4 = make_membership('never', 'never', 'never', 'hourly')
            m5 = make_membership('never', 'never', 'never', 'never')

            m1.update!(:user => user)
            m2.update!(:user => user)
            m3.update!(:user => user)
            m4.update!(:user => user)
            m5.update!(:user => user)

            memberships = user.memberships_to_notify("hourly")
            memberships.should =~ [social_membership, m1, m2, m3, m4]
            memberships.first.should == social_membership
          end
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

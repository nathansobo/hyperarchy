require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

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
    end

    describe "#password and #password=" do
      specify "#password= assigns #encrypted_password such that #password returns a BCrypt::Password object that will be == to the assigned unencrypted password" do
        user.password = "password"
        user.encrypted_password.should_not be_nil
        user.password.should == "password"
        user.password.should_not == "foo"
      end
    end

    describe "SSL-related methods" do
      attr_reader :ssl_org, :non_ssl_org, :ssl_user, :non_ssl_user
      
      before do
        @ssl_org = Organization.make(:use_ssl => true)
        @non_ssl_org = Organization.make
        @ssl_user = User.make
        @non_ssl_user = User.make
        ssl_org.memberships.create!(:user => ssl_user, :suppress_invite_email => true)
        non_ssl_org.memberships.create!(:user => non_ssl_user, :suppress_invite_email => true)
        non_ssl_org.memberships.create!(:user => non_ssl_user, :suppress_invite_email => true)
      end
      
      describe "#may_need_ssl?" do
        it "returns true if the user is a member of any organizations that are secured with SSL" do
          ssl_user.may_need_ssl?.should be_true
          non_ssl_user.may_need_ssl?.should be_false
        end
      end

      describe "#ssl_election_ids" do
        it "returns a list of every election id in SSL organizations in which the user is a member" do
          ssl_election_1 = ssl_org.elections.create!(:body => "SSL Election 1", :suppress_notification_email => true)
          ssl_election_2 = ssl_org.elections.create!(:body => "SSL Election 2", :suppress_notification_email => true)
          non_ssl_org.elections.create!(:body => "Non SSL Election", :suppress_notification_email => true)

          election_ids = ssl_user.ssl_election_ids
          election_ids.length.should == 2
          election_ids.should include(ssl_election_1.id)
          election_ids.should include(ssl_election_2.id)
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
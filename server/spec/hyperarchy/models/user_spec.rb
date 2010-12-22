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

    describe "#after_create" do
      it "if on production, sends admin an email about the new user" do
        with_rack_env("production") do
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
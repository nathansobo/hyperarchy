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

    describe "after create" do
      it "automatically creates a membership for the 'Alpha Testers' organization" do
        alpha_org = Organization.find(:name => ALPHA_TEST_ORG_NAME)
        user.memberships.find(:pending => false, :organization => alpha_org).should_not be_nil
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
  end
end
require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "/private", :type => :rack do

  attr_accessor :org, :user
  before do
    @org = Organization.make
    @user = User.make
  end

  context "if the user is already logged in" do
    before do
      login_as(user)
    end

    context "if the invitation code is valid" do
      it "makes the user a member of the organization and redirects to the organization's page" do
        get "/private/#{org.invitation_code}"
        last_response.should be_redirect
        last_response.location.should == "/#view=organization&organizationId=#{org.id}"
        user.memberships.where(:organization_id => org.id).size.should == 1
      end
    end

    context "if the invitation code is not valid" do
      it "redirects to the default organization" do
        wrong_code = "this_is_not_a_code"
        get "/private/#{wrong_code}"
        last_response.should be_redirect
        default_org_id = Organization.social.id
        last_response.location.should == "/#view=organization&organizationId=#{default_org_id}"
        user.memberships.where(:organization_id => org.id).size.should == 0
      end
    end
  end

  context "if the user is not logged in" do

    context "if the invitation code is valid" do
      it "logs them in as the guest of that organization and redirects to that organization's page" do
        get "/private/#{org.invitation_code}"
        last_response.should be_redirect
        last_response.location.should == "/#view=organization&organizationId=#{org.id}"
        current_user.should_not be_nil
        current_user.memberships.where(:organization_id => org.id).size.should == 1
      end
    end

    context "if the invitation code is not valid" do
      it "redirects to the default organization" do
        wrong_code = "this_is_not_a_code"
        get "/private/#{wrong_code}"
        current_user.should be_guest
        default_org_id = Organization.social.id
        last_response.location.should == "/#view=organization&organizationId=#{default_org_id}"
        current_user.memberships.where(:organization_id => org.id, :pending => false).size.should == 0
      end
    end

  end
end
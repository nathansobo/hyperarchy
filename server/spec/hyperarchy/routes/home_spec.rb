require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "GET /", :type => :rack do
  context "if a member is logged in" do
    it "redirects the user to their last visited organization" do
      current_user = login_as(User.make)
      org1 = Organization.make
      org2 = Organization.make

      Timecop.freeze(Time.now)
      org1.memberships.create!(:user => current_user, :suppress_invite_email => true)
      Timecop.freeze(Time.now + 60)
      org2.memberships.create!(:user => current_user, :suppress_invite_email => true)

      get "/"
      last_response.should be_redirect
      last_response.location.should == "/app#view=organization&organizationId=#{org2.id}"
    end
  end

  context "if a guest is logged in" do
    it "redirects the guest to the social organization" do
      login_as(User.guest)
      social_org = Organization.find(:social => true)
      
      get "/"
      last_response.should be_redirect
      last_response.location.should == "/app#view=organization&organizationId=#{social_org.id}"
    end
  end
end

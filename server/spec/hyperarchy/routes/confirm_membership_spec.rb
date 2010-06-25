require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "GET /confirm_membership/:membership_id", :type => :rack do
  attr_reader :user, :membership
  before do
    @user = User.make
    @membership = Membership.make(:user => membership_user)
    login_as user
  end

  def membership_user
    @membership_user ||= user
  end

  context "when the membership belongs to the logged-in user" do
    it "renders the confirm/decline membership page" do
      get "/confirm_membership/#{membership.id}"
      last_response.should be_ok
    end
  end

  context "when the membership does not belong to the logged in user" do
    def membership_user
      @membership_user ||= User.make
    end

    it "redirects to the main page" do
      get "/confirm_membership/#{membership.id}"
      last_response.should be_redirect
      last_response.location.should == "/app"
    end
  end
end

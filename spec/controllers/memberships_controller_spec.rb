require 'spec_helper'

describe MembershipsController do
  describe "#confirm" do
    attr_reader :membership
    before do
      @membership = Membership.make(:pending => true)
    end

    context "if authenticated as the user who owns the membership" do
      before do
        login_as(membership.user)
      end

      it "marks the membership as confirmed and redirects to its overview page" do
        get :confirm, :id => membership.to_param
        membership.should_not be_pending
        response.should redirect_to(root_url(:anchor => "view=organization&organizationId=#{membership.organization_id}"))
      end
    end

    context "if authenticated as a different user" do
      before do
        login_as(User.make)
      end

      it "does not mark the membership as confirmed and redirects to the default organization" do
        get :confirm, :id => membership.to_param
        membership.should be_pending
        response.should redirect_to(root_url(:anchor => "view=organization&organizationId=#{current_user.default_organization.id}"))
      end
    end

    context "if not authenticated" do
      it "redirects to the login page" do
        get :confirm, :id => membership.to_param
        membership.should be_pending
        response.should redirect_to(login_path)
      end
    end
  end
end

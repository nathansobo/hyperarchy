require 'spec_helper'

describe ElectionsController do
  attr_reader :public_org, :private_org, :member_org, :member

  describe "#index" do
    before do
      @public_org = Organization.make(:privacy => 'public')
      @private_org = Organization.make(:privacy => 'private')
      @member_org = Organization.make(:privacy => "private")
      @member = User.make
      member_org.memberships.make(:user => member)
    end

    def perform_get(organization)
      xhr :get, :index, :organization_id => organization.id, :offset => 0, :limit => 1
    end

    context "if not authenticated" do
      it "responds with forbidden" do
        current_user.should be_nil
        perform_get(Organization.make)
        response.should be_forbidden
      end
    end

    context "if authenticated as a guest" do
      before do
        login_as(User.guest)
      end

      it "only allows the user to read elections from publicly readable organizations" do
        perform_get(private_org)
        response.should be_forbidden

        perform_get(public_org)
        response.should be_success
      end
    end

    context "if authenticated as a member" do
      before do
        login_as(member)
      end

      it "allows the user to read elections from publicly readable organizations and organizations they are members of" do
        perform_get(private_org)
        response.should be_forbidden

        perform_get(public_org)
        response.should be_success

        perform_get(member_org)
        response.should be_success
      end
    end

    context "if authenticated as an admin" do
      before do
        login_as(User.make(:admin => true))
      end

      it "allows the user to read elections from anywhere" do
        perform_get(private_org)
        response.should be_success

        perform_get(public_org)
        response.should be_success

        perform_get(member_org)
        response.should be_success
      end
    end
  end
end

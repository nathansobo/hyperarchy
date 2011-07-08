require 'spec_helper'

describe MembershipsController do
  let(:organization) { Organization.make }
  let(:user) { User.make(:password => "password") }

  describe "#create" do
    context "if the membership_code is valid" do
      context "when logged in as a normal user who isn't a member of the organization" do
        it "gives the user a membership to the organization, if they don't already have one" do
          login_as(user)
          current_user.memberships.where(:organization => organization).should be_empty
          get :create, :organization_id => organization.id, :code => organization.membership_code
          current_user.memberships.where(:organization => organization, :role => "member").size.should == 1
          response.should redirect_to(organization_url(organization))

          # a subsequent request does not create a duplicate membership
          expect do
            get :create, :organization_id => organization.id, :code => organization.membership_code
          end.not_to change(current_user.memberships, :size)
        end
      end

      context "if the user is logged in as a guest of another organization" do
        it "logs the user in as the organization's special guest" do
          login_as Organization.social.guest
          get :create, :organization_id => organization.id, :code => organization.membership_code
          current_user.should == organization.guest

          response.should redirect_to(organization_url(organization))
        end
      end

      context "if the user is not logged in" do
        it "logs the user in as the organization's special guest" do
          current_user.should == User.default_guest
          get :create, :organization_id => organization.id, :code => organization.membership_code
          current_user.should == organization.guest
          response.should redirect_to(organization_url(organization))
        end
      end
    end

    context "if the membership_code is not valid" do
      context "if the user is logged in and has a default_organization other than hyperarchy social" do
        it "redirects the user to their default organization" do
          login_as(user)
          default_org = Organization.make
          stub(user).default_organization { default_org }
          get :create, :organization_id => organization.id, :code => "garbage"
          response.should redirect_to(organization_url(default_org))
        end
      end

      context "if the user is not logged in" do
        it "redirects them to hyperarchy social" do
          current_user.should == User.default_guest
          get :create, :organization_id => organization.id, :code => "garbage"
          current_user.should == User.default_guest
          response.should redirect_to(organization_url(Organization.social))
        end
      end
    end
  end
end

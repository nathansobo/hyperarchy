require 'spec_helper'

describe SessionsController do
  attr_reader :organization, :user, :membership
  before do
    @organization = Organization.social
    @user = User.make(:password => "password")
    @membership = organization.memberships.make(:user => user)
  end

  describe "#new" do
    it "renders successfully" do
      get :new
      response.should be_success
    end
  end

  describe "#create" do
    describe "when the email address and password match an existing user" do
      it "logs the user in, and returns the current user id plus the user's initial dataset" do
        current_user.should == User.default_guest
        xhr :post, :create, :user => { :email_address => user.email_address, :password => "password" }
        Prequel.session.current_user.should == user
        current_user.should == user

        response.should be_success
        response_json["data"].should == { "current_user_id" => user.id }
        response_json["records"]["users"].should have_key(user.to_param)
        response_json["records"]["organizations"].should have_key(organization.to_param)
        response_json["records"]["memberships"].should have_key(membership.to_param)
      end
    end

    describe "when the email address does not match an existing user" do
      it "does not set a current user and returns error messages" do
        current_user.should == User.default_guest
        xhr :post, :create, :user => { :email_address => "garbage", :password => "password" }
        current_user.should == User.default_guest

        response.status.should == 422
        response_json["errors"].should_not be_empty
      end
    end

    describe "when the password does not match an existing user" do
      it "does not set a current user and returns error messages" do
        current_user.should == User.default_guest
        xhr :post, :create, :user => { :email_address => user.email_address, :password => "garbage" }
        current_user.should == User.default_guest

        response.status.should == 422
        response_json["errors"].should_not be_empty
      end
    end
  end

  describe "#destroy" do
    it "logs the current user out and redirects to the root" do
      login_as(user)
      mock(Prequel.session).current_user = user # this happens before the log out
      mock(Prequel.session).current_user = nil # this should happen upon log out
      current_user.should_not be_nil
      post :destroy
      response.should redirect_to(root_path)
      current_user.should == User.default_guest
    end
  end

  describe "#create_from_secret_url" do
    context "if the invitation_code is valid" do
      context "when logged in as a normal user who isn't a member of the organization" do
        it "gives the user a membership to the organization, if they don't already have one" do
          organization = Organization.make
          login_as(user)
          current_user.memberships.where(:organization => organization).should be_empty
          get :create_from_secret_url, :organization_id => organization.id, :invitation_code => organization.invitation_code
          current_user.memberships.where(:organization => organization, :pending => false, :role => "member").size.should == 1
          response.should be_success

          # a subsequent request does not create a duplicate membership
          expect do
            get :create_from_secret_url, :organization_id => organization.id, :invitation_code => organization.invitation_code
          end.not_to change(current_user.memberships, :size)
        end
      end

      context "if the user is logged in as a guest of another organization" do
        it "logs the user in as the organization's special guest" do
          login_as Organization.social.guest
          get :create_from_secret_url, :organization_id => organization.id, :invitation_code => organization.invitation_code
          current_user.should == organization.guest
          response.should be_success
        end
      end

      context "if the user is not logged in" do
        it "logs the user in as the organization's special guest" do
          current_user.should == User.default_guest
          get :create_from_secret_url, :organization_id => organization.id, :invitation_code => organization.invitation_code
          current_user.should == organization.guest
          response.should be_success
        end
      end
    end

    context "if the invitation_code is not valid" do
      context "if the user is logged in and has a default_organization other than hyperarchy social" do
        it "redirects the user to their default organization" do
          login_as(user)
          default_org = Organization.make
          stub(user).default_organization { default_org }
          get :create_from_secret_url, :organization_id => organization.id, :invitation_code => "garbage"
          response.should redirect_to(root_url(:anchor => "view=organization&organizationId=#{default_org.id}"))
        end
      end

      context "if the user is not logged in" do
        it "redirects them to hyperarchy social" do
          current_user.should == User.default_guest
          get :create_from_secret_url, :organization_id => organization.id, :invitation_code => "garbage"
          current_user.should == User.default_guest
          response.should redirect_to(root_url(:anchor => "view=organization&organizationId=#{Organization.social.id}"))
        end
      end
    end
  end
end

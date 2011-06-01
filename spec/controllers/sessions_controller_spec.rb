require 'spec_helper'

describe SessionsController do
  let(:organization) { Organization.make }
  let(:user) { User.make(:password => "password") }

  describe "#new" do
    it "renders successfully" do
      get :new
      response.should be_success
    end
  end

  describe "#create" do
    context "when the email address and password match an existing user" do
      context "when logged in as the default guest" do
        attr_reader :membership
        before { @membership = organization.memberships.make(:user => user) }

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


      context "when logged in as a special guest" do
        it "creates a membership on the guest's organization for the user who logs in" do
          login_as organization.guest

          user.should_not be_member_of(organization)
          xhr :post, :create, :user => { :email_address => user.email_address, :password => "password" }
          current_user.should == user

          membership = user.memberships.find(:organization => organization)
          membership.should be
          response_json["records"]["memberships"].should have_key(membership.to_param)
        end
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
end

require 'spec_helper'

describe SessionsController do
  attr_reader :organization, :user, :membership
  before do
    @organization = Organization.social
    @user = User.make(:password => "password")
    @membership = organization.memberships.make(:user => user)
  end

  describe "#create" do
    describe "when the email address and password match an existing user" do
      it "logs the user in, and returns the current user id plus the user's initial dataset" do
        mock(Monarch::Model::Repository).current_user = user
        current_user.should be_nil
        xhr :post, :create, :user => { :email_address => user.email_address, :password => "password" }
        current_user.should == user

        response_json["successful"].should be_true
        response_json["data"].should == { "current_user_id" => user.id }
        response_json["dataset"]["users"].should have_key(user.to_param)
        response_json["dataset"]["organizations"].should have_key(organization.to_param)
        response_json["dataset"]["memberships"].should have_key(membership.to_param)
      end
    end

    describe "when the email address does not match an existing user" do
      it "does not set a current user and returns error messages" do
        current_user.should be_nil
        xhr :post, :create, :user => { :email_address => "garbage", :password => "password" }
        current_user.should be_nil

        response_json["successful"].should be_false
        response_json["data"]["errors"].should_not be_nil
      end
    end

    describe "when the password does not match an existing user" do
      it "does not set a current user and returns error messages" do
        current_user.should be_nil
        xhr :post, :create, :user => { :email_address => user.email_address, :password => "garbage" }
        current_user.should be_nil

        response_json["successful"].should be_false
        response_json["data"]["errors"].should_not be_nil
      end
    end
  end

  describe "#destroy" do
    it "logs the current user out" do
      login_as(user)
      mock(Monarch::Model::Repository).current_user = user # this happens before the log out
      mock(Monarch::Model::Repository).current_user = nil # this should happen upon log out
      current_user.should_not be_nil
      xhr :post, :destroy
      current_user.should be_nil
    end
  end
end

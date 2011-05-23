require 'spec_helper'

describe UsersController do
  describe "#create" do
    context "when all the params are valid" do
      it "creates the user, logs them in, and makes them a member of social" do
        current_user.should be_nil

        xhr :post, :create, :user => User.plan
        response.should be_success

        current_user.should_not be_nil
        current_user.should be_persisted
        current_user.first_name.should == user_params[:first_name]
        current_user.last_name.should == user_params[:last_name]
        current_user.email_address.should == user_params[:email_address]
        current_user.password.should == user_params[:password]

        current_user.organizations.all.should == [Organization.social]
        current_user.memberships.first.role.should == "member"

        response_json["data"].should == { "current_user_id" => current_user.id }
        response_json["records"].tap do |records|
          records["organizations"][Organization.social.to_param].should == Organization.social.wire_representation
          records["users"][current_user.to_param].should == current_user.wire_representation
          records["memberships"][current_user.memberships.first.to_param].should == current_user.memberships.first.wire_representation
        end
      end
    end

    context "when the user params are invalid" do
      it "returns a 422 status with errors" do
        current_user.should be_nil
        xhr :post, :create, :user => User.plan(:first_name => '', :password => '')
        current_user.should be_nil

        response.status.should == 422
        response_json["errors"].should_not be_empty
      end
    end
  end
end

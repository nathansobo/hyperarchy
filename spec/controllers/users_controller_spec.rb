require 'spec_helper'

describe UsersController do
  describe "#new" do
    it "assigns an empty user" do
      get :new
      response.should be_success
      assigns[:user].should_not be_nil
    end
  end

  describe "#create" do
    context "for a normal request" do
      context "when there is no invitation code set in the session and organization parameters are supplied" do
        context "when all the params are valid" do
          let(:user_params) { User.plan }
          let(:organization_params) {{ :name => "Organization Name" }}

          it "creates the user, logs them in, makes them an owner of a new organization by the specified name and redirects to that organization" do
            current_user.should be_nil

            post :create, :user => user_params, :organization => organization_params

            current_user.should_not be_nil
            current_user.should be_persisted
            current_user.first_name.should == user_params[:first_name]
            current_user.last_name.should == user_params[:last_name]
            current_user.email_address.should == user_params[:email_address]
            current_user.password.should == user_params[:password]

            current_user.memberships.size.should == 1
            current_user.memberships.first.role.should == "owner"

            organization = current_user.organizations.first
            organization.name.should == organization_params[:name]

            response.should redirect_to(root_path(:anchor => "view=organization&organizationId=#{organization.id}"))
          end
        end

        context "when the user params are invalid" do

        end

        context "when the organization params are invalid" do

        end
      end
    end

    context "for an XHR request" do

    end
  end
end

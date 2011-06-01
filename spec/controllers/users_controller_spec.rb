require 'spec_helper'

describe UsersController do
  describe "#create" do
    context "when no organization name is provided" do
      context "when all the params are valid" do
        context "when the user is logged in as the default guest" do
          it "creates the user, logs them in, and makes them a member of social" do
            current_user.should == User.default_guest

            user_params = User.plan
            xhr :post, :create, :user => user_params
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

        context "when the user is logged in as the special guest of an organization" do
          it "creates the user, logs them in, and makes them a member of social and of the special guest's organization" do
            organization = Organization.make
            login_as organization.guest
                        user_params = User.plan
            xhr :post, :create, :user => user_params
            response.should be_success
            membership = current_user.memberships.find(:organization => organization)
            current_user.organizations.all.should =~ [Organization.social, organization]
            
            response_json["records"]["memberships"][membership.to_param].should == membership.wire_representation
          end
        end
      end

      context "when the user params are invalid" do
        it "returns a 422 status with errors" do
          current_user.should == User.default_guest
          xhr :post, :create, :user => User.plan(:first_name => '', :password => '')
          current_user.should == User.default_guest

          response.status.should == 422
          response_json["errors"].should_not be_empty
        end
      end
    end

    context "when an organization name is provided" do
      context "when all the params are valid" do
        it "signs the user up as normal, and then makes them the owner of an organization with the given name" do
          current_user.should == User.default_guest

          user_params = User.plan
          xhr :post, :create, :user => user_params, :organization => { :name => "Acme Org" }
          response.should be_success

          current_user.should_not be_nil

          current_user.organizations.size.should == 2
          current_user.organizations.find(:social => true).should_not be_nil
          new_org = current_user.organizations.find(:social => false)
          new_org.name.should == "Acme Org"

          current_user.memberships.find(:organization => Organization.social).role.should == "member"
          current_user.memberships.find(:organization => new_org).role.should == "owner"

          response_json["data"].should == { "current_user_id" => current_user.id, "new_organization_id" => new_org.id }
          response_json["records"].tap do |records|
            records["organizations"][Organization.social.to_param].should == Organization.social.wire_representation
            records["organizations"][new_org.to_param].should == new_org.wire_representation
            records["users"][current_user.to_param].should == current_user.wire_representation
            records["memberships"][current_user.memberships.all[0].to_param].should == current_user.memberships.all[0].wire_representation
            records["memberships"][current_user.memberships.all[1].to_param].should == current_user.memberships.all[1].wire_representation
          end
        end
      end

      context "when the organization name is blank" do
        it "does not sign up the user or create an organization, and responds with an error" do

          orig_user_count = User.count
          orig_org_count = Organization.count

          user_params = User.plan
          xhr :post, :create, :user => user_params, :organization => { :name => "" }

          response.status.should == 422
          response_json['errors'].should_not be_empty
          current_user.should == User.default_guest

          User.count.should == orig_user_count
          Organization.count.should == orig_org_count
        end
      end
    end
  end
end

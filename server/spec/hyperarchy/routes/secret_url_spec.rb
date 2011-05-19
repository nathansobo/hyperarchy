require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "/private", :type => :rack do

  attr_accessor :org, :user
  before do
    @org = Organization.make
    @user = User.make(:email_address => "billy@example.com", :password => "spectrum")
  end

  context "if the user is already logged in" do
    before do
      login_as(user)
    end

    context "if the invitation code is valid" do
      it "makes the user a member of the organization and redirects to the organization's page" do
        get "/private/#{org.invitation_code}"
        last_response.should be_redirect
        last_response.location.should == "/#view=organization&organizationId=#{org.id}"
        user.memberships.where(:organization_id => org.id).size.should == 1
      end
    end

    context "if the invitation code is not valid" do
      it "redirects to the default organization" do
        wrong_code = "this_is_not_a_code"
        get "/private/#{wrong_code}"
        last_response.should be_redirect
        default_org_id = Organization.social.id
        last_response.location.should == "/#view=organization&organizationId=#{default_org_id}"
        user.memberships.where(:organization_id => org.id).size.should == 0
      end
    end
  end

  context "if the user is not logged in" do
    context "if the invitation code is valid" do
      before do
        get "/private/#{org.invitation_code}"
      end
      
      it "logs them in as the guest of that organization and redirects to that organization's page" do
        last_response.should be_redirect
        last_response.location.should == "/#view=organization&organizationId=#{org.id}"
        current_user.should_not be_nil
        current_user.should be_guest
        current_user.memberships.where(:organization_id => org.id).size.should == 1
      end

      context "if the user then logs into their existing account" do
        context "if they log in successfully" do
          it "gives them a membership to the organization" do
            xhr_post "/login", :email_address => user.email_address, :password => "spectrum"
            current_user.should == user
            current_user.should_not be_guest
            current_user.memberships.where(:organization_id => org.id).size.should == 1
          end
        end

        context "if they don't log in successfully" do
          it "keeps them signed in as that organization's special guest" do
            xhr_post "/login", :email_address => user.email_address, :password => "garbage"
            current_user.should be_guest
            current_user.memberships.where(:organization_id => org.id).size.should == 1
          end
        end
      end
      
      context "if the user then signs up for a new account" do
        context "if they provide valid information" do
          it "gives the newly created user a membership to the organization" do
            xhr_post "/signup", :user => {
              :first_name => "Joe",
              :last_name => "Camel",
              :email_address => "joe@example.com",
              :password => "nicotine"
            }.to_json
            last_response.should be_ok

            current_user.should_not be_guest
            current_user.memberships.where(:organization_id => org.id).size.should == 1
          end
        end

        context "if they provide invalid information" do
          it "keeps them signed in as that organization's special guest" do
            xhr_post "/signup", :user => {
              :first_name => "Joe"
            }.to_json
            current_user.should be_guest
            current_user.memberships.where(:organization_id => org.id).size.should == 1
          end
        end
      end
    end

    context "if the invitation code is not valid" do
      it "redirects to the default organization" do
        wrong_code = "this_is_not_a_code"
        get "/private/#{wrong_code}"
        current_user.should be_guest
        default_org_id = Organization.social.id
        last_response.location.should == "/#view=organization&organizationId=#{default_org_id}"
        current_user.memberships.where(:organization_id => org.id, :pending => false).size.should == 0
      end
    end
  end
end

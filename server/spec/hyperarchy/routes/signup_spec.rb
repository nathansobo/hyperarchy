require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "/signup", :type => :rack do
  describe "GET /signup" do
    context "if accessed without HTTPS" do
      it "redirects to the same url, but with HTTPS" do
        get "/signup", {}, {"HTTP_X_FORWARDED_PROTO" => "http"}

        last_response.should be_redirect
        last_response.location.should == "https://example.org/signup"
      end
    end

    context "if a user is already logged in" do
      it "redirects them to their last-visited organization" do
        org = Organization.make
        user = make_member(org)
        login_as(user)

        get "/signup"
        last_response.should be_redirect
        last_response.location.should == "/#view=organization&organizationId=#{org.id}"
      end
    end

    context "if an invitation code is specified" do
      attr_reader :invitation

      before do
        @invitation = Invitation.create!(:inviter => User.make, :sent_to_address => "steph@example.com")
        Membership.make(:invitation => invitation, :organization => Organization.make)
      end

      context "if the invitation code is valid" do
        it "sets the invitation code in the session object" do
          get "/signup", :invitation_code => invitation.guid
          session[:invitation_code].should == invitation.guid
        end
      end

      context "if the invitation is no longer associated with any memberships (because they were deleted)" do
        it "redirects to /" do
          invitation.memberships.each(&:destroy)
          get "/signup", :invitation_code => invitation.guid
          last_response.should be_redirect
          last_response.location.should == "/"
        end
      end

      context "if the invitation code is not valid" do
        it "redirects to /signup with no query params, clears the invitation code in the session, and sets :invalid_invitation_code in the flash" do
          get "/signup", :invitation_code => "garbage"
          last_response.should be_redirect
          last_response.location.should == "/signup"
          session[:invitation_code].should be_nil
          flash[:invalid_invitation_code].should == "garbage"
        end
      end

      context "if the invitation code has already been redeemed" do
        it "redirects to /login, clears the invitation code in the session, and sets the :already_redeemed code in the flash" do
          invitation.update!(:redeemed => true)

          get "/signup", :invitation_code => invitation.guid
          last_response.should be_redirect
          last_response.location.should == "/login"
          session[:invitation_code].should be_nil
          flash[:already_redeemed].should == invitation.guid
        end
      end
    end

    context "if an invalid invitation code is specified" do
      it "sets :invalid_invitation_code in the flash and redirects back to /signup with no params" do
        get "/signup", :invitation_code => "junk"
        last_response.should be_redirect
        last_response.location.should == "/signup"
        flash[:invalid_invitation_code].should == "junk"
      end
    end
  end

  describe "POST /signup" do
    attr_reader :user_attributes

    before do
      @user_attributes = {
        :email_address => "steph@example.com",
        :first_name => "Stephanie",
        :last_name => "Wambach",
        :password => "password"
      }
    end

    context "if the request is XHR" do
      attr_reader :guest
      before do
        @guest = User.guest
        login_as(guest)
      end

      context "if all the params are valid" do
        context "if no :organization_name param is given" do
          it "creates and authenticates a new user and returns its id and a dataset containing its record" do
            xhr_post "/signup", :user => {
              :first_name => "Joe",
              :last_name => "Camel",
              :email_address => "joe@example.com",
              :password => "nicotine"
            }.to_json
            last_response.should be_ok

            current_user.should_not == guest
            current_user.first_name.should == "Joe"

            response_json = last_response.body_from_json
            response_json["successful"].should be_true
            response_json["data"].should == {"current_user_id" => current_user.id}
            response_json["dataset"]["users"][current_user.id.to_s].should == current_user.wire_representation
          end
        end

        context "if an :organization_name param is given" do
          it "creates and authenticates a new user and makes them the owner of a new organization with the given name" do
            xhr_post "/signup", :user => {
              :first_name => "Joe",
              :last_name => "Camel",
              :email_address => "joe@example.com",
              :password => "nicotine",
              :organization_name => "joe's organization"
            }.to_json
            last_response.should be_ok

            current_user.should_not == guest
            current_user.first_name.should == "Joe"

            current_user.organizations.size.should == 2
            new_org = current_user.memberships.where(:role => "owner").join_through(Organization).first
            new_org.name.should == "joe's organization"


            current_user.default_organization.should == new_org
            membership = new_org.memberships.where(:user => current_user).first

            response_json = last_response.body_from_json
            response_json["successful"].should be_true
            response_json["data"].should == {"current_user_id" => current_user.id, "new_organization_id" => new_org.id}
            response_json["dataset"]["users"][current_user.id.to_s].should == current_user.wire_representation
            response_json["dataset"]["organizations"][new_org.id.to_s].should == new_org.wire_representation
            response_json["dataset"]["memberships"][membership.id.to_s].should == membership.wire_representation
          end
        end
      end

      context "if any of the params are invalid" do
        it "returns an unsuccessful json response with validation errors" do
          invalid_params = {
            :first_name => "Joe",
            :last_name => "",
            :email_address => "",
            :password => "nicotine"
          }

          xhr_post "/signup", :user => invalid_params.to_json

          current_user.should == guest

          response_json = last_response.body_from_json
          response_json["successful"].should be_false
          response_json["data"]["errors"].should == User.new(invalid_params).validation_errors_by_column_name.values.flatten
        end
      end

      context "if the organization name param is supplied but blank" do
        it "returns a validation error" do
          xhr_post "/signup", :user => { :organization_name => "" }.to_json
          current_user.should == guest
          response_json = last_response.body_from_json
          response_json["successful"].should be_false
          response_json["data"]["errors"].first.should =~ /Organization/
        end
      end
    end

    context "if no invitation code has been associated with the session" do
      context "if all the parameters are valid" do
        it "creates a user with the given attributes and makes them owner of an organization with the given name, then redirects to that organization" do
          post "/signup", :user => user_attributes, :organization => { :name => "The Foo Bar" }
          current_user.should_not be_nil
          current_user.should be_persisted
          current_user.first_name.should == user_attributes[:first_name]
          current_user.last_name.should == user_attributes[:last_name]
          current_user.email_address.should == user_attributes[:email_address]
          current_user.password.should == user_attributes[:password]


          current_user.memberships.size.should == 2
          current_user.memberships.find(:organization_id => Organization.social.id).should_not be_nil

          new_org_membership = current_user.memberships.find(:role => 'owner')
          organization = new_org_membership.organization
          organization.name.should == "The Foo Bar"

          last_response.should be_redirect
          last_response.location.should == "/#view=organization&organizationId=#{organization.id}"
        end
      end

      context "if a user param is not valid" do
        it "does not create a user and redirects back to /signup with errors" do
          user_attributes[:first_name] = ""
          post "/signup", :user => user_attributes, :organization => { :name  => "McDonalds Evil Backroom" }
          last_response.should be_redirect
          last_response.location.should == "/signup"

          current_user.should == Organization.social.guest
          flash[:errors].should_not be_nil
        end
      end

      context "if the organization name is blank" do
        it "does not create a user and redirects back to /signup with errors" do
          dont_allow(Organization).create!
          post "/signup", :user => user_attributes, :organization => { :name  => "" }
          last_response.should be_redirect
          last_response.location.should == "/signup"

          current_user.should == Organization.social.guest
          flash[:errors].should_not be_nil
        end
      end
    end

    context "if an invitation code has been associated with the session" do
      attr_reader :invitation, :membership_1, :membership_2

      before do
        @invitation = Invitation.create!(:sent_to_address => "steph@example.com", :inviter => User.make)
        @membership_1 = Membership.make(:invitation => invitation)
        @membership_2 = Membership.make(:invitation => invitation)
        get "/signup", :invitation_code => invitation.guid
      end

      context "if the invitation has NOT been redeemed" do
        context "if the user parameters are valid" do
          it "does not attempt to create an organization and instead redeems the invitation with the given user and makes them a member of the associated organizations" do
            dont_allow(Organization).create
            dont_allow(Organization).create!

            post "/signup", :user => user_attributes
            session.should_not have_key(:invitation_code)

            current_user.should_not be_nil
            current_user.should be_persisted
            current_user.first_name.should == user_attributes[:first_name]
            current_user.last_name.should == user_attributes[:last_name]
            current_user.email_address.should == user_attributes[:email_address]
            current_user.password.should == user_attributes[:password]

            invitation.should be_redeemed
            invitation.invitee.should == current_user
            membership_1.user.should == current_user
            membership_2.user.should == current_user
          end
        end

        context "if the user parameters are NOT valid" do
          before do
            user_attributes[:first_name] = ""
          end

          it "does not redeem the invitation and instead redirects back to /signup with an error" do
            post "/signup", :user => user_attributes
            last_response.should be_redirect
            last_response.location.should == "/signup"
            flash[:errors].should_not be_nil

            current_user.should == Organization.social.guest
          end
        end
      end

      context "if the invitation has been already redeemed" do
        it "redirects to /login without creating a user, sets :already_redeemed in the flash and clears the invitation_code from the session" do
          invitation.update!(:redeemed => true)
          post "/signup", :user => user_attributes
          session.should_not have_key(:invitation_code)

          last_response.should be_redirect
          last_response.location.should == "/login"

          current_user.should == Organization.social.guest
        end
      end
    end
  end
end

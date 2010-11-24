require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "/signup", :type => :rack do
  describe "GET /signup" do

    context "if a user is already logged in" do
      it "redirects them to their last-visited organization" do
        org = Organization.make
        user = make_member(org)
        login_as(user)

        get "/signup"
        last_response.should be_redirect
        last_response.location.should == "/app#view=organization&organizationId=#{org.id}"
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

          current_user.memberships.size.should == 1
          current_user.memberships.first.role.should == "owner"

          organization = current_user.organizations.first
          organization.name.should == "The Foo Bar"

          last_response.should be_redirect
          last_response.location.should == "/app#view=organization&organizationId=#{organization.id}"
        end
      end

      context "if a user param is not valid" do
        it "does not create a user and redirects back to /signup with errors" do
          user_attributes[:first_name] = ""
          post "/signup", :user => user_attributes, :organization => { :name  => "McDonalds Evil Backroom" }
          last_response.should be_redirect
          last_response.location.should == "/signup"

          current_user.should be_nil
          flash[:errors].should_not be_nil
        end
      end

      context "if the organization name is blank" do
        it "does not create a user and redirects back to /signup with errors" do
          dont_allow(Organization).create!
          post "/signup", :user => user_attributes, :organization => { :name  => "" }
          last_response.should be_redirect
          last_response.location.should == "/signup"

          current_user.should be_nil
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

            current_user.should be_nil
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

          current_user.should be_nil
        end
      end
    end
  end
end
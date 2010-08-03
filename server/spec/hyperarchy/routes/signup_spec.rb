require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "/signup", :type => :rack do
  describe "GET /signup" do
    context "if an invalid invitation code is specified" do
      it "sets :invalid_invitation_code in the flash and redirects back to /signup with no params" do
        get "/signup", :invitation_code => "junk"
        last_response.should be_redirect
        last_response.location.should == "/signup"
        flash[:invalid_invitation_code].should == true
      end
    end

    context "if an already-redeemed invitation code is specified" do
      attr_reader :invitation
      before do
        @invitation = Invitation.create!(:inviter => User.make, :sent_to_address => "steph@example.com", :redeemed => true)
      end

      it "sets :already_redeemed in the flash and redirects back to /signup with no params" do
        get "/signup", :invitation_code => invitation.guid
        last_response.should be_redirect
        last_response.location.should == "/signup"
        flash[:already_redeemed].should == true
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

    context "if the invite code is valid" do
      attr_reader :invitation, :membership_1, :membership_2, :membership_3

      before do
        @invitation = Invitation.create!(:sent_to_address => "steph@example.com", :inviter => User.make)
        @membership_1 = Membership.make(:invitation => invitation)
        @membership_2 = Membership.make(:invitation => invitation)
        @membership_3 = Membership.make(:invitation => invitation)
      end

      context "if the invitation has not been redeemed" do

        context "if the parameters are valid" do
          it "creates a user with the given parameters, logs them in, and redirects to the organizations page" do
            post "/signup", :invitation_code => invitation.guid, :redeem => { :user => user_attributes, :confirm_memberships => [membership_1.id, membership_3.id]}
            current_user.should_not be_dirty
            current_user.full_name.should == "Stephanie Wambach"
            current_user.email_address.should == "steph@example.com"
            current_user.password.should == "password"

            last_response.should be_redirect
            last_response.location.should == "/app#view=organization"

            membership_1.should_not be_pending
            membership_3.should_not be_pending
            Membership.find(membership_2.id).should be_nil
          end
        end

        context "if the parameters are not valid" do
          it "redirects back to /signup with :errors set in the flash" do
            user_attributes[:first_name] = ""

            post "/signup", :invitation_code => invitation.guid, :redeem => { :user => user_attributes, :confirm_memberships => [membership_1.id, membership_3.id]}
            current_user.should be_nil
            last_response.should be_ok
            flash[:errors].should_not be_nil
          end
        end
      end

      context "if the invitation has already been redeemed" do
        it "redirects back to /signup, with :already_redeemed set in the flash" do
          invitation.update(:redeemed => true)
          post "/signup", :invitation_code => invitation.guid, :user => user_attributes

          current_user.should be_nil
          last_response.should be_redirect
          last_response.location.should == "/signup"
          flash[:already_redeemed].should == true
        end
      end
    end

    context "if the invite code is not valid" do
      it "redirects back to /signup, with :invalid_invitation_code set in the flash" do
        post "/signup", :invitation_code => "garbage", :user => user_attributes

        current_user.should be_nil
        last_response.should be_redirect
        last_response.location.should == "/signup"
        flash[:invalid_invitation_code].should == true
      end
    end
  end
end
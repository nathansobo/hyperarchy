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
      attr_reader :invitation

      before do
        @invitation = Invitation.create(:sent_to_address => "steph@example.com", :inviter => User.make)
      end

      context "if the invitation has not been redeemed" do
        it "creates a user with the given parameters, logs them in, and redirects to the organizations page" do
          post "/signup", :invitation_code => invitation.guid, :user => user_attributes
          current_user.should_not be_dirty
          current_user.full_name.should == "Stephanie Wambach"
          current_user.email_address.should == "steph@example.com"
          current_user.password.should == "password"

          last_response.should be_redirect
          last_response.location.should == "/app#view=organization"
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
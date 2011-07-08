require 'spec_helper'

describe PasswordResetsController do
  attr_reader :user
  before do
    freeze_time
    @user = User.make
    user.generate_password_reset_token
  end

  describe "#new" do
    context "if the token corresponds to a user and was generated < 1 hour ago" do
      it "renders successfully" do
        jump 30.minutes
        get :new, :token => user.password_reset_token
        response.should be_success
        response.should render_template(Views::PasswordResets::New)
        assigns[:token].should == user.password_reset_token
      end
    end

    context "if the token corresponds to a user but was generated > 1 hour ago" do
      it "renders an expired page" do
        jump 2.hours
        get :new, :token => user.password_reset_token
        response.should be_success
        response.should render_template(Views::PasswordResets::Expired)
      end
    end

    context "if the token does not correspond to a user" do
      it "renders an expired page" do
        get :new, :token => "garbage"
        response.should be_success
        response.should render_template(Views::PasswordResets::Expired)
      end
    end
  end

  describe "#create" do
    context "if the token corresponds to a user and was generated < 1 hour ago" do
      context "if a password is supplied" do
        it "resets the user's password, logs them in, and redirects them to their default organization" do
          jump 30.minutes
          post :create, :token => user.password_reset_token, :password => "new password", :password_confirmation => "new password"
          current_user.should == user
          user.password.should == "new password"
          default_org_id = user.default_organization.id
          response.should redirect_to(organization_url(user.default_organization))
        end
      end

      context "if the password is blank" do
        it "re-renders the form with an error" do
          post :create, :token => user.password_reset_token, :password => ""
          flash[:errors].should_not be_empty
          assigns[:token].should == user.password_reset_token
          response.should be_success
          response.should render_template(Views::PasswordResets::New)
        end
      end

      context "if the password and password confirmation do not match" do
        it "re-renders the form with an error" do
          post :create, :token => user.password_reset_token, :password => "new password", :password_confirmation => "different password"
          flash[:errors].should_not be_empty
          assigns[:token].should == user.password_reset_token
          response.should be_success
          response.should render_template(Views::PasswordResets::New)
        end
      end
    end

    context "if the token corresponds to a user but was generated > 1 hour ago" do
      it "renders an expired page" do
        jump 2.hours
        post :create, :token => user.password_reset_token
        response.should be_success
        response.should render_template(Views::PasswordResets::Expired)
      end
    end

    context "if the token does not correspond to a user" do
      it "renders an expired page" do
        get :new, :token => "garbage"
        response.should be_success
        response.should render_template(Views::PasswordResets::Expired)
      end
    end

  end
end

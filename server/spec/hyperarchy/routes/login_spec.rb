require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /login", :type => :rack do
  attr_reader :user

  before do
    @user = User.make(:email_address => "billy@example.com", :password => "spectrum")
  end

  context "if accessed without HTTPS" do
    it "redirects to the same url, but with HTTPS" do
      get "/login", {}, {"HTTP_X_FORWARDED_PROTO" => "http"}

      last_response.should be_redirect
      last_response.location.should == "https://example.org/login"

    end
  end

  context "if a User with the given email address exists" do
    context "if the given password matches that User" do
      it "sets the current_user and redirects to the application" do
        post "/login", :email_address => user.email_address, :password => "spectrum"

        current_user.should == user
        last_response.should be_redirect
        last_response.location.should == "/app#view=organization"
      end

      context "if the redirected_from param is present" do
        it "redirects to the given param after authenticating instead of /app" do
          post "/login", :email_address => user.email_address, :password => "spectrum", :redirected_from => "/foo"

          current_user.should == user
          last_response.should be_redirect
          last_response.location.should == "/foo"
        end
      end
    end

    context "if the given password does NOT match that User" do
      it "does not set the current_user and redirects back to /#logIn" do
        post "/login", :email_address => user.email_address, :password => "incorrectpassword"

        current_user.should be_nil
        last_response.should be_redirect
        last_response.location.should == "/login"
        flash[:errors].first.should include("password")
        flash[:entered_email_address].should == user.email_address
        flash[:email_address_errors].should be_nil
      end
    end
  end

  context "if no User with the given email address exists" do
    it "does not set the current_user and returns an unsuccessful ajax response with errors on email_address" do
      post "/login", :email_address => "bogus@example.com", :password => "spectrum"

      current_user.should be_nil
      last_response.should be_redirect
      last_response.location.should == "/login"
      flash[:errors].first.should include("email")
      flash[:entered_email_address].should == "bogus@example.com"
      flash[:email_address_errors].should_not be_nil
    end
  end
end
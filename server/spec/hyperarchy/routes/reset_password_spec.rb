require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")


describe "GET /reset_password" do
  it "renders only if the token is valid, and redirects to /request_password_reset with an error" do
    pending
    user = User.make
    user.generate_password_reset_token

    get "/reset_password", :token => user.password_reset_token
    last_response.should be_ok

    get "/reset_password", :token => "junk"
    last_response.should be_redirect
    last_response.location.should == "/request_password_reset"

    flash[:errors].should_not be_nil
  end
end

describe "POST /reset_password", :type => :rack do
  it "resets the user's password and authenticates them if the given token is valid" do
    user = User.make
    user.generate_password_reset_token

    post "/reset_password", :token => user.password_reset_token, :password => "newpassword"

    current_user.should == user
    current_user.password.should == "newpassword"

    last_response.should be_redirect
    last_response.location.should == "/app"
  end
end

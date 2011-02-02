require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")


describe "GET /reset_password", :type => :rack do
  it "renders only if the token is valid, and redirects to /request_password_reset with an error" do
    user = User.make
    user.generate_password_reset_token

    get "/reset_password", :token => user.password_reset_token
    last_response.should be_ok

    get "/reset_password", :token => "junk"
    last_response.should be_redirect
    last_response.location.should == "/request_password_reset"
    flash[:errors].should_not be_nil

    User.make # this user has a nil reset token
    get "/reset_password" # no token
    last_response.should be_redirect
    last_response.location.should == "/request_password_reset"
    flash[:errors].should_not be_nil
  end
end

describe "POST /reset_password", :type => :rack do
  it "resets the user's password and authenticates them if the given token is valid and the password confirmation matches" do
    user = User.make
    user.generate_password_reset_token

    post "/reset_password", :token => user.password_reset_token, :password => "newpassword", :password_confirmation => "newpassword"

    current_user.should == user
    current_user.password.should == "newpassword"

    last_response.should be_redirect
    last_response.location.should == "/app"

    # bad confirmation
    post "/reset_password", :token => user.password_reset_token, :password => "newpassword", :password_confirmation => "bad"
    last_response.should be_ok
    flash[:errors].should_not be_nil

    # bad token
    post "/reset_password", :token => "junk", :password => "newpassword", :password_confirmation => "newpassword"
    last_response.should be_redirect
    last_response.location.should == "/request_password_reset"
    flash[:errors].should_not be_nil
  end
end

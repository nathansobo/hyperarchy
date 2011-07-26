require 'spec_helper'

describe HomeController do
  describe "#show" do
    it "renders the Views::Home::Show template" do
      login_as(User.make)
      get :show
      response.should be_success
      response.should render_template(Views::Home::Show)
    end

    it "does not require authentication" do
      get :show
      response.should be_success
      response.should render_template(Views::Home::Show)
    end

    it "puts the share_code in the session if there is an 's' param" do
      get :show, :s => "sharecode11"
      session[:share_code].should == "sharecode11"
    end
  end
end

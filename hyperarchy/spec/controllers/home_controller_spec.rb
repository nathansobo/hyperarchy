require 'spec_helper'

describe HomeController do
  describe "#show" do
    describe "when not authenticated" do
      it "authenticates the guest user and proceeds" do
        current_user.should be_nil
        get :show
        current_user.should == User.guest
        response.should be_success

        show = Views::Home::Show.new
        stub(show).current_user { current_user }
        puts show.to_html

        response.should render_template(Views::Home::Show)

        puts response.body
      end
    end

    describe "when authenticated" do
      it "renders the template" do
        user = login_as(User.make)
        get :show
        current_user.should == user
        response.should be_success
        response.should render_template(Views::Home::Show)
      end
    end
  end
end

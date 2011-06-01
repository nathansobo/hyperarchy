require 'spec_helper'

describe HomeController do
  describe "#show" do
    describe "when not authenticated" do
      it "renders the Views::Home::Show template" do
        get :show
        response.should be_success
        response.should render_template(Views::Home::Show)
      end
    end

    describe "when authenticated" do
      it "renders the Views::Home::Show template" do
        user = login_as(User.make)
        get :show
        response.should be_success
        response.should render_template(Views::Home::Show)
      end
    end
  end
end

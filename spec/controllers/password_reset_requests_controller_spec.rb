require 'spec_helper'

describe PasswordResetRequestsController do
  describe "#new" do
    it "renders successfully" do
      get :new
      response.should be_success
      response.should render_template(Views::PasswordResetRequests::New)
    end
  end

  describe "#create" do
    attr_reader :user
    before do
      freeze_time
      @user = User.make
      user.password_reset_token.should be_nil
      user.password_reset_token_generated_at.should be_nil
      clear_deliveries
    end

    context "when the email address exists" do
      it "assigns a password reset token on the user and sends them a password reset email" do
        post :create, :email_address => user.email_address
        user.password_reset_token.should_not be_nil
        user.password_reset_token_generated_at.should == Time.now

        ActionMailer::Base.deliveries.length.should == 1
        email = ActionMailer::Base.deliveries.shift
        email.to.map(&:to_s).should == [user.email_address]
        email.html_part.body.should include(user.password_reset_token)
        email.text_part.body.should include(user.password_reset_token)
      end
    end

    context "when the email address does not correspond to any existing user" do

      it "re-renders the form with an error" do
        post :create, :email_address => "garbage"
        response.should be_success
        flash[:errors].should_not be_empty
        response.should render_template(Views::PasswordResetRequests::New)
      end
    end
  end
end

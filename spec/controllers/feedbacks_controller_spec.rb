require 'spec_helper'

describe FeedbacksController do
  let(:organization) { Organization.make }
  let(:user) { User.make(:password => "password") }
  let(:membership) { organization.memberships.make(:user => user) }

  describe "#create" do
    it "sends an email to max and nathan with the feedback and the user's name" do
      login_as(User.make)
      post :create, :feedback => "hi. this is feedback."
      response.should be_success

      ActionMailer::Base.deliveries.length.should == 1
      email = ActionMailer::Base.deliveries.shift

      email.to.should == ["max@hyperarchy.com", "nathan@hyperarchy.com"]
      email.body.should include("hi. this is feedback.")
      email.body.should include(current_user.full_name)
      email.body.should include(current_user.email_address)
    end
  end
end

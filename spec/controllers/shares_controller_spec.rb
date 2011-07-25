require 'spec_helper'

describe SharesController do
  describe "#create" do
    it "inserts a share record in the database" do
      login_as User.make
      expect {
        post :create, :code => "randomcode", :service => "facebook", :question_id => 90
      }.to change(Share, :count).by(1)
      response.should be_success

      new_share = Share.find(:code => "randomcode")
      new_share.service.should == "facebook"
      new_share.question_id.should == 90
    end
  end
end

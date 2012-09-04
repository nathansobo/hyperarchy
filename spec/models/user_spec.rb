require 'spec_helper'

module Models
  describe User do
    let(:user) { User.make! }

    describe "#validate" do
      it "ensures the email address is unique" do
        user.should be_valid
        new_user = User.make(:email_address => user.email_address)
        new_user.should_not be_valid
      end
    end

    describe "security" do
      describe "#can_update? and #can_destroy?" do
        it "only the users themselves to update / destroy user records" do
          other_user = User.make!

          set_current_user(other_user)
          user.can_update?.should be_false
          user.can_destroy?.should be_false

          set_current_user(user)
          user.can_update?.should be_true
          user.can_destroy?.should be_true
        end
      end
    end
  end
end

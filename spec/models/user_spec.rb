require 'spec_helper'

module Models
  describe User do
    let(:user) { User.make! }

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

require 'spec_helper'

module Models
  describe ElectionComment do
    describe "#before_create" do
      it "assigns the current user as the creator" do
        set_current_user(User.make)
        comment = ElectionComment.make
        comment.creator.should == current_user
      end
    end
  end
end
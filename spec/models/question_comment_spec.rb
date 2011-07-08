require 'spec_helper'

module Models
  describe QuestionComment do
    describe "#before_create" do
      it "assigns the current user as the creator" do
        set_current_user(User.make)
        comment = QuestionComment.make
        comment.creator.should == current_user
      end
    end
  end
end
require 'spec_helper'

module Models
  describe QuestionPermission do
    describe "#after_initialize" do
      it "assigns its question_id and user_id based on the question with a matching secret and the current user" do
        set_current_user(User.make!)
        question = Question.make!(:visibility => 'private', :secret => 'secret')
        permission = QuestionPermission.create!(:secret => 'secret')
        permission.question.should == question
        permission.user.should == current_user
      end

      describe "if the question belongs to a group" do
        it "only assigns the question_id and current_user if the user is a member of the group" do
          group = Group.make!
          member = User.make!
          group.add_member(member)
          non_member = User.make!
          question = group.questions.make!(:visibility => 'private', :secret => 'secret')

          set_current_user(member)
          permission = QuestionPermission.create!(:secret => 'secret')
          permission.question.should == question
          permission.user.should == member

          set_current_user(non_member)
          expect { QuestionPermission.create!(:secret => 'secret') }.to raise_error
        end
      end
    end

    describe "validation" do
      it "is invalid if the question_id is not assigned" do
        permission = QuestionPermission.create(:secret => 'secret')
        permission.valid?.should be_false
      end
    end

    describe "security" do
      it "does not allow the question_id or user_id to be assigned on creation" do
        permission = QuestionPermission.secure_create(:user_id => 1, :question_id => 1)
        permission.question_id.should be_nil
        permission.user_id.should be_nil
      end

      it "does not allow the permission to be updated" do
        set_current_user(User.make!)
        question = Question.make!(:secret => 'secret')
        permission = QuestionPermission.create!(:secret => 'secret')
        permission.can_update?.should be_false
      end
    end
  end
end

require 'spec_helper'

describe Vote do
  describe "after create or destroy" do
    attr_reader :user_1, :user_2, :question, :answer

    before do
      @user_1 = User.make
      @user_2 = User.make
      @question = Question.make
      @answer = question.answers.make
    end

    specify "the vote count of the question is increment or decrement appropriately" do
      question.vote_count.should == 0
      ranking_1 = question.rankings.create(:user => user_1, :answer => answer, :position => 64)
      vote_1 = ranking_1.vote
      vote_1.should_not be_nil
      vote_1.question.should == question
      question.vote_count.should == 1

      ranking_2 = question.rankings.create(:user => user_2, :answer => answer, :position => 64)
      vote_2 = ranking_2.vote
      question.vote_count.should == 2

      vote_1.destroy
      question.vote_count.should == 1
      vote_2.destroy
      question.vote_count.should == 0
    end
  end
end

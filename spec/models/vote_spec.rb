require 'spec_helper'

describe Ranking do
  describe "after create or destroy" do
    attr_reader :user_1, :user_2, :question, :answer

    before do
      @user_1 = User.make!
      @user_2 = User.make!
      @question = Question.make!
      @answer = question.answers.make!
    end

    specify "the ranking count of the question is increment or decrement appropriately" do
      question.ranking_count.should == 0
      preference_1 = question.preferences.create(:user => user_1, :answer => answer, :position => 64)
      ranking_1 = preference_1.ranking
      ranking_1.should_not be_nil
      ranking_1.question.should == question
      question.ranking_count.should == 1

      preference_2 = question.preferences.create(:user => user_2, :answer => answer, :position => 64)
      ranking_2 = preference_2.ranking
      question.ranking_count.should == 2

      ranking_1.destroy
      question.ranking_count.should == 1
      ranking_2.destroy
      question.ranking_count.should == 0
    end
  end
end

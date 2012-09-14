require 'spec_helper'

describe RankingsController, :focus => true do
  attr_reader :question, :c1, :c2

  before do
    @question = Question.make!
    @c1 = question.answers.make!
    @c2 = question.answers.make!
    login_as User.make!
  end

  describe "when no ranking for the specified answer exists for the current user" do
    it "creates a ranking" do
      Ranking.find(:user => current_user, :answer => c1).should be_nil

      post :create, :answer_id => c1.to_param, :position => '64'
      response.should be_success

      c1_ranking = Ranking.find(:user => current_user, :answer => c1)
      c1_ranking.position.should == 64

      response_json['data'].should == { 'ranking_id' => c1_ranking.id }
      response_json["records"]["rankings"].should have_key(c1_ranking.to_param)
    end
  end

  describe "when a ranking for the specified answer already exists for the current user" do
    it "updates its position" do
      c1_ranking = Ranking.create!(:user => current_user, :answer => c1, :position => 32)

      post :create, :answer_id => c1.id, :position => 64
      response.should be_success

      c1_ranking.position.should == 64

      response_json['data'].should == { 'ranking_id' => c1_ranking.id }
      response_json["records"]["rankings"].should have_key(c1_ranking.to_param)
    end
  end
end

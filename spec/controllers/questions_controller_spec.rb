require 'spec_helper'

describe QuestionsController do
  describe "#show" do
    attr_reader :group, :member, :non_member, :group_question, :private_group_question, :private_question
    before do
      @group = Group.make!
      @group_question = group.questions.make!(:visibility => 'group')
      @private_group_question = group.questions.make!(:visibility => 'private')
      @private_question = Question.make!(:visibility => 'private')

      @member = User.make!
      group.add_member(member)
      @non_member = User.make!
    end

    it "only allows private questions to be fetched by secret" do
      login_as(member)

      get :show, :id => private_group_question.secret
      response.status.should == 200

      get :show, :id => private_group_question.id.to_s
      response.status.should == 404

      get :show, :id => private_question.id.to_s
      response.status.should == 404
    end

    it "only allows group questions to be fetched by group members" do
      login_as(member)

      get :show, :id => group_question.to_param
      response.status.should == 200

      get :show, :id => private_group_question.to_param
      response.status.should == 200

      login_as(non_member)

      get :show, :id => group_question.to_param
      response.status.should == 404

      get :show, :id => private_group_question.to_param
      response.status.should == 404
    end
  end
end

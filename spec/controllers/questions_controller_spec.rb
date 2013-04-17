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

    describe "when the user is not superuser-enabled" do
      it "allows private questions to be fetched if the user has permission" do
        login_as(member)

        # can't fetch until we have permission, which is only granted to non superusers when we fetch via the secret
        get :show, :id => private_group_question.id.to_s
        response.status.should == 404

        get :show, :id => private_question.id.to_s
        response.status.should == 404

        # fetching via the secret works, and once we do so we can also fetch via id
        get :show, :id => private_group_question.secret
        response.status.should == 200

        get :show, :id => private_group_question.id.to_s
        response.status.should == 200

        get :show, :id => private_question.secret
        response.status.should == 200

        get :show, :id => private_question.id.to_s
        response.status.should == 200
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

    describe "when the user is superuser enabled" do
      before do
        non_member.update!(:superuser_enabled => true)
        login_as(non_member)
      end

      it "allows private and group questions to be fetched, even if the user is not a member of the group" do
        get :show, :id => private_group_question.secret
        response.status.should == 200

        get :show, :id => group_question.to_param
        response.status.should == 200

        get :show, :id => private_group_question.to_param
        response.status.should == 200
      end

    end
  end
end

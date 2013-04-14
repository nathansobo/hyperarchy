require 'spec_helper'

describe SandboxController do
  attr_reader :group, :other_group, :question, :user

  before do
    @user = login_as User.make!
    @group = Group.make!
    group.add_member(user)
    @other_group = Group.make!
    @question = group.questions.make!(:creator => user)
  end

  describe "#fetch" do
    it "calls #fetch on the sandbox object with the given relations, parsed from json and returns the result as json" do
      get :fetch, :relations => [Question.wire_representation].to_json
      JSON.parse(response.body)['questions'][question.to_param].should == question.wire_representation
    end
  end

  describe "#create" do
    context "when creating a legal record" do
      it "creates the record and returns its wire representation" do
        Question.count.should == 1
        post :create, :relation => "questions", :field_values => group.questions.make.field_values
        response.should be_success
        Question.count.should == 2
        json = JSON.parse(response.body)
        json.should == Question.find(json['id']).wire_representation
      end
    end

    context "when creating a record that's out of the bounds of the exposed relation" do
      it "returns '403 forbidden'" do
        expect {
          post :create, :relation => "questions", :field_values => other_group.questions.make.field_values
        }.to_not change Question, :count
        response.should be_forbidden
      end
    end

    context "when creating an invalid record" do
      it "returns validation errors" do
        post :create, :relation => "questions", :field_values => {}
        response.status.should == 422 # unprocessable entity
        json = JSON.parse(response.body)
        json['body'].should_not be_empty
      end
    end

    context "when creating in a non-existent relation" do
      it "returns a 404 not found" do
        post :create, :relation => "junk"
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    describe "when performing a legal update" do
      it "updates the record and returns its new wire representation" do
        put :update, :relation => "questions", :id => question.to_param, :field_values => { :body => "New body" }
        response.should be_success
        json = JSON.parse(response.body)
        json.should == question.wire_representation
        question.body.should == "New body"
      end
    end

    describe "when performing an invalid update" do
      it "returns '422 unprocessable entity'" do
        put :update, :relation => "questions", :id => question.to_param, :field_values => { :body => "" }
        response.status.should == 422
        json = JSON.parse(response.body)
        json['body'].should_not be_empty
      end
    end

    describe "when performing an update against a relation that does not exist" do
      it "returns '404 not found'" do
        put :update, :relation => "junk", :id => '1', :field_values => { :body => "New body" }
        response.status.should == 404
      end
    end

    describe "when performing an update against a record that is not in the relation" do
      it "returns '404 not found'" do
        bogus_id = Question.all.last.id + 1
        put :update, :relation => "questions", :id => bogus_id.to_s, :field_values => { :body => "New body" }
        response.status.should == 404
      end
    end

    describe "when performing an update to make a record outside of the bounds of the exposed relation" do
      it "returns '403 forbidden'" do
        put :update, :relation => "questions", :id => question.id.to_s, :field_values => { :group_id => other_group.id }
        response.status.should == 403
        question.reload.group_id.should == group.id
      end
    end
  end

  describe "#destroy" do
    describe "when destroying a record that exists" do
      it "destroys the record and returns 200 ok" do
        delete :destroy, :relation => "questions", :id => question.to_param
        response.should be_success
        Question.find(question.id).should be_nil
      end
    end

    describe "when destroying a record that doesn't exist" do
      it "returns '404 not found'" do
        bogus_id = Question.all.last.id + 1
        delete :destroy, :relation => "questions", :id => bogus_id.to_s
        response.status.should == 404
      end
    end

    describe "when destroying a record that's not part of the exposed relation" do
      it "returns '404 not found' and does not destroy the record" do
        other_question = other_group.questions.make!
        delete :destroy, :relation => "questions", :id => other_question.id.to_s
        response.status.should == 404
        Question.find(other_question.id).should be
      end
    end

    describe "when the specified relation does not exist" do
      it "returns '404 not found'" do
        delete :destroy, :relation => "junk", :id => '909'
        response.status.should == 404
      end
    end
  end
end

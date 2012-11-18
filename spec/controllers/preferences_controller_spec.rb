require 'spec_helper'

describe PreferencesController do
  attr_reader :question, :c1, :c2

  before do
    @question = Question.make!
    @c1 = question.answers.make!
    @c2 = question.answers.make!
    login_as User.make!
  end

  describe "POST" do
    describe "when no preference for the specified answer exists for the current user" do
      it "creates a preference" do
        Preference.find(:user => current_user, :answer => c1).should be_nil

        post :create, :answer_id => c1.to_param, :position => '64'
        response.should be_success

        c1_preference = Preference.find(:user => current_user, :answer => c1)
        c1_preference.position.should == 64

        response_json['data'].should == { 'preference_id' => c1_preference.id }
        response_json["records"]["preferences"].should have_key(c1_preference.to_param)
      end
    end

    describe "when a preference for the specified answer already exists for the current user" do
      it "updates its position" do
        c1_preference = Preference.create!(:user => current_user, :answer => c1, :position => 32)

        post :create, :answer_id => c1.id, :position => 64
        response.should be_success

        c1_preference.position.should == 64

        response_json['data'].should == { 'preference_id' => c1_preference.id }
        response_json["records"]["preferences"].should have_key(c1_preference.to_param)
      end
    end
  end

  describe "DELETE" do
    fit "destroys the preference for the current user with the specified answer id" do
      c1_preference = Preference.create!(:user => current_user, :answer => c1, :position => 32)

      delete :destroy, :answer_id => c1.id
      response.should be_success

      Preference.find(c1_preference.id).should be_blank
    end
  end
end

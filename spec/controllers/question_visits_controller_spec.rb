require 'spec_helper'

describe QuestionVisitsController do
  describe "#create" do

    let(:question) { Question.make }

    context "for a normal user" do
      before do
        login_as question.organization.make_member
      end

      context "when the question has never been visited" do
        it "creates an question visit record for the current user and question and returns the visit record" do
          current_user.question_visits.where(:question => question).should be_empty
          post :create, :question_id => question.to_param
          response.should be_success
          visit = current_user.question_visits.find(:question => question)
          visit.should_not be_nil

          response_json['question_visits'].should have_key(visit.to_param)
        end
      end

      context "when the question has already been visited" do
        it "updates the visited_at time on the question visit record to the current time and returns the visit record" do
          freeze_time
          existing_visit = current_user.question_visits.create!(:question => question)
          jump 10.minutes
          post :create, :question_id => question.to_param
          response.should be_success
          existing_visit.updated_at.to_i.should == Time.now.to_i

          response_json['question_visits'].should have_key(existing_visit.to_param)
        end
      end
    end

    context "for a guest user" do
      it "does not create an question visit" do
        QuestionVisit.should be_empty
        post :create, :question_id => question.to_param
        QuestionVisit.should be_empty
      end
    end
  end
end

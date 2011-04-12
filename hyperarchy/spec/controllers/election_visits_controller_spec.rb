require 'spec_helper'

describe ElectionVisitsController do
  describe "#create" do

    let(:election) { Election.make }

    context "for a normal user" do
      before do
        login_as make_member(election.organization)
      end

      context "when the election has never been visited" do
        it "creates an election visit record for the current user and election and returns the visit record" do
          current_user.election_visits.where(:election => election).should be_empty
          post :create, :election_id => election.to_param
          response.should be_success
          visit = current_user.election_visits.find(:election => election)
          visit.should_not be_nil

          response_json['election_visits'].should have_key(visit.to_param)
        end
      end

      context "when the election has already been visited" do
        it "updates the visited_at time on the election visit record to the current time and returns the visit record" do
          freeze_time
          existing_visit = current_user.election_visits.create!(:election => election)
          jump 10.minutes
          post :create, :election_id => election.to_param
          response.should be_success
          existing_visit.updated_at.to_i.should == Time.now.to_i

          response_json['election_visits'].should have_key(existing_visit.to_param)
        end
      end
    end

    context "for a guest user" do
      before do
        login_as User.guest
      end

      it "does not create an election visit" do
        ElectionVisit.should be_empty
        post :create, :election_id => election.to_param
        ElectionVisit.should be_empty
      end
    end
  end
end

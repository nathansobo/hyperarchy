require 'spec_helper'

describe RankingsController do
  attr_reader :organization, :member, :non_member, :election, :c1, :c2

  before do
    @organization = Organization.make
    @election = organization.elections.make
    @c1 = election.candidates.make
    @c2 = election.candidates.make
    @member = make_member(organization)
    @non_member = User.make
  end

  context "when authenticated as a member of the ranked election's organization" do
    before do
      login_as member
    end

    context "when no ranking for the specified candidate exists for the current user" do
      it "creates a ranking" do
        Ranking.find(:user => member, :candidate => c1).should be_nil

        post :create, :candidate_id => c1.to_param, :position => '64'
        response.should be_success

        c1_ranking = Ranking.find(:user => member, :candidate => c1)
        c1_ranking.position.should == 64

        response_json['data'].should == { 'ranking_id' => c1_ranking.id }
        response_json["records"]["rankings"].should have_key(c1_ranking.to_param)
      end
    end

    context "when a ranking for the specified candidate already exists for the current user" do
      it "updates its position" do
        c1_ranking = Ranking.create!(:user => member, :candidate => c1, :position => 32)

        post :create, :candidate_id => c1.id, :position => 64
        response.should be_success

        c1_ranking.position.should == 64
        
        response_json['data'].should == { 'ranking_id' => c1_ranking.id }
        response_json["records"]["rankings"].should have_key(c1_ranking.to_param)
      end
    end
  end

  context "when authenticated as a user that is not a member of the ranked election's organization" do
    before do
      login_as(non_member)
    end

    context "if the organization is public" do
      before do
        organization.update(:privacy => 'public')
      end

      it "makes the user a member of the organization before proceeding and includes the new membership in the returned records" do
        Ranking.find(:user => member, :candidate => c1).should be_nil
        non_member.memberships.where(:organization => organization).should be_empty

        post :create, :candidate_id => c1.id, :position => 64
        response.should be_success

        new_membership = non_member.memberships.find(:organization => organization)
        new_membership.should be
        c1_ranking = Ranking.find(:user => non_member, :candidate => c1)
        c1_ranking.position.should == 64

        response_json['data'].should == { 'ranking_id' => c1_ranking.id }
        response_json['records']['memberships'].should have_key(new_membership.to_param)
        response_json['records']['rankings'].should have_key(c1_ranking.to_param)
      end
    end

    context "if the organization is not public" do
      before do
        organization.privacy.should_not == 'public'
      end

      it "returns a security error" do
        post :create, :candidate_id => c1.id, :position => 64
        response.status.should == 403
      end
    end
  end

  context "when not authenticated" do
    it "returns a security error" do
      post :create
      response.status.should == 403
    end
  end

  context "when only authenticated as a guest" do
    it "returns a security error" do
      login_as(User.guest)
      post :create
      response.status.should == 403
    end
  end
end

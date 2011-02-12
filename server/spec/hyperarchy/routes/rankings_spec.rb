require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /rankings", :type => :rack do
  attr_reader :organization, :member, :non_member, :election, :c1, :c2

  before do
    @organization = Organization.make
    @election = organization.elections.make
    @c1 = election.candidates.make
    @c2 = election.candidates.make
    @member = make_member(organization)
    @non_member = User.make
  end

  it "finds a ranking with the specified user and candidate or creates a new one, then updates it with the specified position and returns it in the dataset" do
    # must be authenticated
    post "/rankings", :candidate_id => c1.id, :position => 64
    last_response.status.should == 401

    login_as(member)
    post "/rankings", :candidate_id => c1.id, :position => 64
    c1_ranking = Ranking.find(:user => member, :candidate => c1)
    c1_ranking.position.should == 64
    last_response.should be_ok
    last_response.dataset["rankings"].should have_key(c1_ranking.to_param)

    post "/rankings", :candidate_id => c1.id, :position => 32
    Ranking.where(:user => member, :election => election).size.should == 1
    last_response.dataset["rankings"].should have_key(c1_ranking.to_param)

    post "/rankings", :candidate_id => c2.id, :position => 64
    Ranking.where(:user => member, :election => election).size.should == 2
    c2_ranking = Ranking.find(:user => member, :candidate => c2)
    c2_ranking.position.should == 64
    last_response.dataset["rankings"].should have_key(c2_ranking.to_param)
  end

  context "when the organization is private or read-only" do
    it "only allows members to rank" do
      login_as(non_member)

      organization.update(:privacy => "read_only")
      post "/rankings", :candidate_id => c1.id, :position => 64
      last_response.status.should == 401

      organization.update(:privacy => "private")
      post "/rankings", :candidate_id => c1.id, :position => 64
      last_response.status.should == 401
    end
  end

  context "when the organization is public" do
    before do
      organization.update(:privacy => "public")
    end

    it "makes the current (non-guest) user a member of the organization if needed before creating the ranking, and returns the membership in the dataset" do
      login_as(User.guest)
      post "/rankings", :candidate_id => c1.id, :position => 64
      last_response.status.should == 401

      login_as(non_member)
      post "/rankings", :candidate_id => c1.id, :position => 64
      c1_ranking = Ranking.find(:user => non_member, :candidate => c1)
      c1_ranking.position.should == 64

      dont_allow(Mailer).send
      new_membership = non_member.memberships.find(:organization => organization)
      new_membership.should_not be_pending
      
      last_response.should be_ok
      last_response.dataset["rankings"].should have_key(c1_ranking.to_param)
      last_response.dataset["memberships"].should have_key(new_membership.to_param)
    end
  end
end

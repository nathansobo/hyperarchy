require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /rankings", :type => :rack do
  attr_reader :organization, :member, :non_member, :election, :c1, :c2

  before do
    @election = Election.make(:body => "Who should win?")
    @c1 = election.candidates.create!(:body => "c1")
    @c2 = election.candidates.create!(:body => "c2")
    @member = make_member(election.organization)
    @non_member = User.make
  end

  it "finds a ranking with the specified user and candidate or creates a new one, then updates it with the specified position" do
    # must be logged in
    post "/rankings", :candidate_id => c1.id, :position => 64

    login_as(member)
    post "/rankings", :candidate_id => c1.id, :position => 64
    Ranking.find(:user => member, :candidate => c1).position.should == 64

    post "/rankings", :candidate_id => c1.id, :position => 32
    Ranking.where(:user => member, :election => election).size.should == 1

    post "/rankings", :candidate_id => c2.id, :position => 64
    Ranking.where(:user => member, :election => election).size.should == 2
    Ranking.find(:user => member, :candidate => c2).position.should == 64

    # must be a member of election's organization
    login_as(non_member)
    post "/rankings", :candidate_id => c1.id, :position => 64
    last_response.status.should == 401
  end
end

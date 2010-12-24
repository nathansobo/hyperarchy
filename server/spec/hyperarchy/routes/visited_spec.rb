require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

describe "POST /visited?election_id=:id", :type => :rack do
  attr_reader :election

  before do
    login_as User.make
    @election = Election.make
  end


  it "creates an election visit for the current user or, if it already exists, updates it with a new updated_at time" do
    Timecop.freeze(Time.now)

    current_user.election_visits.should be_empty
    post "/visited", :election_id => election.id
    current_user.election_visits.size.should == 1

    visit = current_user.election_visits.first
    visit.election.should == election
    visit.created_at.should == Time.now
    visit.updated_at.should == Time.now

    Timecop.freeze(Time.now + 60)
    post "/visited", :election_id => election.id
    current_user.election_visits.size.should == 1
    visit.updated_at.should == Time.now
  end
end
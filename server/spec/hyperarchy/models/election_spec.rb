require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Election do
    attr_reader :election, :memphis, :knoxville, :chattanooga, :nashville

    before do
      @election = Election.create!(:body => "Where should the capital of Tennesee be?")
      @memphis = election.candidates.create!(:body => "Memphis")
      @knoxville = election.candidates.create!(:body => "Knoxville")
      @chattanooga = election.candidates.create!(:body => "Chattanooga")
      @nashville = election.candidates.create!(:body => "Nashville")
    end

    describe "#compute_global_ranking" do
      specify "uses the ranked-pairs algoritm to produce a global ranking" do
        4.times do
          user = User.create
          election.rankings.create(:user => user, :candidate => memphis, :position => 1)
          election.rankings.create(:user => user, :candidate => nashville, :position => 2)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 3)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 4)
        end

        3.times do
          user = User.create
          election.rankings.create(:user => user, :candidate => nashville, :position => 1)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 2)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 3)
          election.rankings.create(:user => user, :candidate => memphis, :position => 4)
        end

        1.times do
          user = User.create
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 1)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 2)
          election.rankings.create(:user => user, :candidate => nashville, :position => 3)
          election.rankings.create(:user => user, :candidate => memphis, :position => 4)
        end

        2.times do
          user = User.create
          election.rankings.create(:user => user, :candidate => knoxville, :position => 1)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 2)
          election.rankings.create(:user => user, :candidate => nashville, :position => 3)
          election.rankings.create(:user => user, :candidate => memphis, :position => 4)
        end

        election.compute_global_ranking

        nashville.reload.position.should == 1
        chattanooga.position.should == 2
        knoxville.position.should == 3
        memphis.position.should == 4
      end
    end
  end
end
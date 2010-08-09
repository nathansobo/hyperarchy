require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Candidate do
    describe "after create" do
      attr_reader :election
      before do
        @election = Election.make
      end

      it "creates a winning and losing majority every pairing of the created candidate with other candidates" do
        election.candidates.should be_empty

        falafel = election.candidates.create(:body => "Falafel")
        tacos = election.candidates.create(:body => "Tacos")

        Majority.find(:winner => falafel, :loser => tacos, :election => election).should_not be_nil
        Majority.find(:winner => tacos, :loser => falafel, :election => election).should_not be_nil

        fish = election.candidates.create(:body => "Fish")
        
        Majority.find(:winner => falafel, :loser => fish, :election => election).should_not be_nil
        Majority.find(:winner => tacos, :loser => fish, :election => election).should_not be_nil
        Majority.find(:winner => fish, :loser => falafel, :election => election).should_not be_nil
        Majority.find(:winner => fish, :loser => tacos, :election => election).should_not be_nil
      end

      it "makes the new candidate lose to every positively ranked candidate and win over every negatively ranked one" do
        user_1 = User.make
        user_2 = User.make
        user_3 = User.make

        _3_up_0_down = election.candidates.create(:body => "3 Up - 0 Down")
        _2_up_1_down = election.candidates.create(:body => "2 Up - 1 Down")
        _1_up_2_down = election.candidates.create(:body => "1 Up - 2 Down")
        _0_up_3_down = election.candidates.create(:body => "0 Up - 3 Down")
        unranked     = election.candidates.create(:body => "Unranked")

        election.rankings.create(:user => user_1, :candidate => _3_up_0_down, :position => 64)
        election.rankings.create(:user => user_1, :candidate => _2_up_1_down, :position => 32)
        election.rankings.create(:user => user_1, :candidate => _1_up_2_down, :position => 16)
        election.rankings.create(:user => user_1, :candidate => _0_up_3_down, :position => -64)

        election.rankings.create(:user => user_2, :candidate => _3_up_0_down, :position => 64)
        election.rankings.create(:user => user_2, :candidate => _2_up_1_down, :position => 32)
        election.rankings.create(:user => user_2, :candidate => _1_up_2_down, :position => -32)
        election.rankings.create(:user => user_2, :candidate => _0_up_3_down, :position => -64)

        election.rankings.create(:user => user_3, :candidate => _3_up_0_down, :position => 64)
        election.rankings.create(:user => user_3, :candidate => _2_up_1_down, :position => -16)
        election.rankings.create(:user => user_3, :candidate => _1_up_2_down, :position => -32)
        election.rankings.create(:user => user_3, :candidate => _0_up_3_down, :position => -64)

        candidate = election.candidates.create(:body => "Alpaca")

        find_majority(_3_up_0_down, candidate).count.should == 3
        find_majority(candidate, _3_up_0_down).count.should == 0

        find_majority(_2_up_1_down, candidate).count.should == 2
        find_majority(candidate, _2_up_1_down).count.should == 1

        find_majority(_1_up_2_down, candidate).count.should == 1
        find_majority(candidate, _1_up_2_down).count.should == 2

        find_majority(_0_up_3_down, candidate).count.should == 0
        find_majority(candidate, _0_up_3_down).count.should == 3

        find_majority(unranked, candidate).count.should == 0
        find_majority(candidate, unranked).count.should == 0
      end
    end
  end
end
require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Candidate do
    describe "after create" do
      use_fixtures

      attr_reader :election
      before do
        @election = Election.find("menu")
      end

      it "creates a winning and losing majority every pairing of the created candidate with other candidates" do
        election.candidates.should be_empty

        falafel = election.candidates.create(:body => "Falafel")
        tacos = election.candidates.create(:body => "Tacos")

        Majority.find({ :winner => falafel, :loser => tacos, :election => election }).should_not be_nil
        Majority.find({ :winner => tacos, :loser => falafel, :election => election }).should_not be_nil

        $on = true
        
        fish = election.candidates.create(:body => "Fish")
        
        Majority.find({ :winner => falafel, :loser => fish, :election => election }).should_not be_nil
        Majority.find({ :winner => tacos, :loser => fish, :election => election }).should_not be_nil
        Majority.find({ :winner => fish, :loser => falafel, :election => election }).should_not be_nil
        Majority.find({ :winner => fish, :loser => tacos, :election => election }).should_not be_nil
      end

      it "for every ranking of an existing candidate by any user, increments that candidates majority over the created candidate" do
        user_1 = User.create!
        user_2 = User.create!
        user_3 = User.create!

        election = Election.find("menu")
        falafel = election.candidates.create(:body => "Falafel")
        tacos = election.candidates.create(:body => "Tacos")
        fish = election.candidates.create(:body => "Fish")
        twinkies = election.candidates.create(:body => "Twinkies") # unranked

        election.rankings.create(:user => user_1, :candidate => falafel, :position => 1)
        election.rankings.create(:user => user_1, :candidate => tacos, :position => 2)
        election.rankings.create(:user => user_1, :candidate => fish, :position => 3)

        election.rankings.create(:user => user_2, :candidate => tacos, :position => 1)
        election.rankings.create(:user => user_2, :candidate => falafel, :position => 2)

        election.rankings.create(:user => user_3, :candidate => falafel, :position => 1)

        candidate = election.candidates.create(:body => "Alpaca")
        find_majority(falafel, candidate).count.should == 3
        find_majority(tacos, candidate).count.should == 2
        find_majority(fish, candidate).count.should == 1
        find_majority(twinkies, candidate).count.should == 0
      end
    end
  end
end
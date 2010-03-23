require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Candidate do
    describe "after create" do
      use_fixtures

      it "creates a winning and losing majority every pairing of the created candidate with other candidates" do
        election = Election.find("menu")
        election.candidates.should be_empty

        falafel = election.candidates.create(:body => "Falafel")
        tacos = election.candidates.create(:body => "Tacos")

        Majority.find({ :winner => falafel, :loser => tacos, :election => election }).should_not be_nil
        Majority.find({ :winner => tacos, :loser => falafel, :election => election }).should_not be_nil

        fish = election.candidates.create(:body => "Fish")
        
        Majority.find({ :winner => falafel, :loser => fish, :election => election }).should_not be_nil
        Majority.find({ :winner => tacos, :loser => fish, :election => election }).should_not be_nil
        Majority.find({ :winner => fish, :loser => falafel, :election => election }).should_not be_nil
        Majority.find({ :winner => fish, :loser => tacos, :election => election }).should_not be_nil
      end
    end
  end
end
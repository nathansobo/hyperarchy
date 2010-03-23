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

        Majority.find({ :winner_id => falafel.id, :loser_id => tacos.id }).should_not be_nil
        Majority.find({ :winner_id => tacos.id, :loser_id => falafel.id }).should_not be_nil

        fish = election.candidates.create(:body => "Fish")
        
        Majority.find({ :winner_id => falafel.id, :loser_id => fish.id }).should_not be_nil
        Majority.find({ :winner_id => tacos.id, :loser_id => fish.id }).should_not be_nil
        Majority.find({ :winner_id => fish.id, :loser_id => falafel.id }).should_not be_nil
        Majority.find({ :winner_id => fish.id, :loser_id => tacos.id }).should_not be_nil
      end
    end
  end
end
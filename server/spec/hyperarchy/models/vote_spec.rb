require File.expand_path(File.dirname(__FILE__) + "/../../hyperarchy_spec_helper")

module Models
  describe Vote do
    describe "after create or destroy" do
      attr_reader :user_1, :user_2, :election, :candidate

      before do
        @user_1 = User.make
        @user_2 = User.make
        @election = Election.make
        @candidate = election.candidates.create(:body => "1")
      end

      specify "the vote count of the election is increment or decrement appropriately" do
        election.vote_count.should == 0
        ranking_1 = election.rankings.create(:user => user_1, :candidate => candidate, :position => 64)
        vote_1 = ranking_1.vote
        vote_1.should_not be_nil
        vote_1.election.should == election
        election.vote_count.should == 1

        ranking_2 = election.rankings.create(:user => user_2, :candidate => candidate, :position => 64)
        vote_2 = ranking_2.vote
        election.vote_count.should == 2

        vote_1.destroy
        election.vote_count.should == 1
        vote_2.destroy
        election.vote_count.should == 0
      end
    end
  end
end

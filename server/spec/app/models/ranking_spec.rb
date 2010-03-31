require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")



module Models
  describe Ranking do
    describe "after create" do
      use_fixtures
      attr_reader :user, :election, :candidate_1, :candidate_2, :candidate_3

      before do
        @user = User.find("nathan")
        @election = Election.find("menu")
        @candidate_1 = election.candidates.create(:body => "1")
        @candidate_2 = election.candidates.create(:body => "2")
        @candidate_3 = election.candidates.create(:body => "3")
      end

      def find_majority(winner, loser)
        election.majorities.find(:winner => winner, :loser => loser).reload
      end

      it %{increments majorities over unranked candidates and lower-ranked candidates,
           decrements majorities of lower-ranked candidates over the newly ranked candidate,
           and does not affect majorities of higher-ranked candidates} do
        election.majorities.each do |majority|
          majority.count.should == 0
        end

        election.rankings.create(:user => user, :candidate => candidate_1, :position => 1)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_1, candidate_3).count.should == 1

        election.rankings.create(:user => user, :candidate => candidate_2, :position => 3)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 1

        election.rankings.create(:user => user, :candidate => candidate_3, :position => 2)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_1, candidate_3).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 0
        find_majority(candidate_3, candidate_1).count.should == 0
        find_majority(candidate_3, candidate_2).count.should == 1
      end
    end
  end
end
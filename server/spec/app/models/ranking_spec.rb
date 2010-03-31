require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")



module Models
  describe Ranking do
    describe "after create, update, or destroy" do
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

      specify "majorities are updated accordingly" do
        election.majorities.each do |majority|
          majority.count.should == 0
        end

        # 1
        ranking_1 = election.rankings.create(:user => user, :candidate => candidate_1, :position => 1)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_1, candidate_3).count.should == 1

        # 1, 2
        ranking_2 = election.rankings.create(:user => user, :candidate => candidate_2, :position => 3)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 1

        # 1, 3, 2
        ranking_3 = election.rankings.create(:user => user, :candidate => candidate_3, :position => 2)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_1, candidate_3).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 0
        find_majority(candidate_3, candidate_1).count.should == 0
        find_majority(candidate_3, candidate_2).count.should == 1

        # 1, 2, 3
        ranking_2.update(:position => 1.5)
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 1
        find_majority(candidate_3, candidate_2).count.should == 0

        # 2, 1, 3
        ranking_1.update(:position => 1.75)
        find_majority(candidate_1, candidate_2).count.should == 0
        find_majority(candidate_1, candidate_3).count.should == 1
        find_majority(candidate_2, candidate_1).count.should == 1
        find_majority(candidate_3, candidate_1).count.should == 0

        # 3, 2, 1
        ranking_3.update(:position => 0.5)
        find_majority(candidate_1, candidate_2).count.should == 0
        find_majority(candidate_1, candidate_3).count.should == 0
        find_majority(candidate_2, candidate_1).count.should == 1
        find_majority(candidate_2, candidate_3).count.should == 0
        find_majority(candidate_3, candidate_1).count.should == 1
        find_majority(candidate_3, candidate_2).count.should == 1

        # 3, 1
        ranking_2.destroy
        find_majority(candidate_1, candidate_2).count.should == 1
        find_majority(candidate_1, candidate_3).count.should == 0
        find_majority(candidate_2, candidate_1).count.should == 0
        find_majority(candidate_2, candidate_3).count.should == 0
        find_majority(candidate_3, candidate_1).count.should == 1
        find_majority(candidate_3, candidate_2).count.should == 1
      end
    end
  end
end
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

      it %{increments majorities over unranked candidates and lower-ranked candidates,
           decrements majorities of lower-ranked candidates over the newly ranked candidate,
           and does not affect majorities of higher-ranked candidates} do
        election.majorities.each do |majority|
          majority.count.should == 0
        end

        election.rankings.create(:user => user, :candidate => candidate_1, :position => 1)

        election.majorities.where(:winner => candidate_1).each do |majority|
          majority.reload.count.should == 1
        end
      end
    end
  end
end
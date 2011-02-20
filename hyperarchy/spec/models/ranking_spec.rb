require 'spec_helper'

module Models
  describe Ranking do
    describe "after create, update, or destroy" do
      attr_reader :user, :election, :candidate_1, :candidate_2, :candidate_3

      before do
        @user = User.make
        @election = Election.make
        @candidate_1 = election.candidates.make(:body => "1")
        @candidate_2 = election.candidates.make(:body => "2")
        @candidate_3 = election.candidates.make(:body => "3")
      end

      specify "majorities are updated accordingly and #compute_global_ranking is called on the ranking's election" do
        election.majorities.each do |majority|
          majority.pro_count.should == 0
        end

        # 1, (2, 3)
        mock.proxy(election).compute_global_ranking
        ranking_1 = election.rankings.create(:user => user, :candidate => candidate_1, :position => 64)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1

        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1

        # 1, 2, (3)
        mock.proxy(election).compute_global_ranking
        ranking_2 = election.rankings.create(:user => user, :candidate => candidate_2, :position => 32)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 1
        find_majority(candidate_2, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_2).con_count.should == 1

        # 1, 3, 2
        mock.proxy(election).compute_global_ranking
        ranking_3 = election.rankings.create(:user => user, :candidate => candidate_3, :position => 48)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_3).con_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_2).con_count.should == 0

        # 1, 2, 3
        mock.proxy(election).compute_global_ranking
        ranking_2.update(:position => 56)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 1
        find_majority(candidate_2, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_2).con_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1

        # 2, 1, 3
        mock.proxy(election).compute_global_ranking
        ranking_1.update(:position => 52)
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_2).con_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 1
        find_majority(candidate_2, candidate_1).con_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 1
        find_majority(candidate_2, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_2).con_count.should == 1

        # 3, 2, 1
        mock.proxy(election).compute_global_ranking
        ranking_3.update(:position => 128)
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_2).con_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_1, candidate_3).con_count.should == 1
        find_majority(candidate_2, candidate_1).pro_count.should == 1
        find_majority(candidate_2, candidate_1).con_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_3).con_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 1
        find_majority(candidate_3, candidate_1).con_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_2).con_count.should == 0

        # 3, 1, (2)
        mock.proxy(election).compute_global_ranking
        ranking_2.destroy
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_1, candidate_3).con_count.should == 1
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_3).con_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 1
        find_majority(candidate_3, candidate_1).con_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_2).con_count.should == 0

        # 1, (2, 3)
        mock.proxy(election).compute_global_ranking
        ranking_3.destroy
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_2).con_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_1, candidate_3).con_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_1).con_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 0
        find_majority(candidate_3, candidate_1).con_count.should == 1
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_2).con_count.should == 0

        mock.proxy(election).compute_global_ranking

        ranking_1.destroy

        election.majorities.each do |majority|
          majority.reload
          majority.pro_count.should == 0
          majority.con_count.should == 0
        end
      end

      specify "negatively ranked candidates are counted as losing to unranked candidates" do
        election.majorities.each do |majority|
          majority.pro_count.should == 0
        end

        # (2, 3), 1
        mock.proxy(election).compute_global_ranking
        ranking_1 = election.rankings.create(:user => user, :candidate => candidate_1, :position => -64)
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_2).con_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_1, candidate_3).con_count.should == 1
        find_majority(candidate_2, candidate_1).pro_count.should == 1
        find_majority(candidate_2, candidate_1).con_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_3).con_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_2).con_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 1
        find_majority(candidate_3, candidate_1).con_count.should == 0

        # (3), 1, 2
        mock.proxy(election).compute_global_ranking
        ranking_2 = election.rankings.create(:user => user, :candidate => candidate_2, :position => -128)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 1

        # (3), 2, 1
        mock.proxy(election).compute_global_ranking
        ranking_2.update(:position => -32)
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 1

        # 1, (3), 2
        mock.proxy(election).compute_global_ranking
        ranking_1.update(:position => 64)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 1
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 0

        # (3), 1, 2
        mock.proxy(election).compute_global_ranking
        ranking_1.update(:position => -16)
        find_majority(candidate_1, candidate_2).pro_count.should == 1
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 1
        find_majority(candidate_3, candidate_1).pro_count.should == 1

        # (3, 2), 1
        mock.proxy(election).compute_global_ranking
        ranking_2.destroy
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 1
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 1

        # (1, 2, 3) -- all unranked
        mock.proxy(election).compute_global_ranking
        ranking_1.destroy
        find_majority(candidate_1, candidate_2).pro_count.should == 0
        find_majority(candidate_1, candidate_3).pro_count.should == 0
        find_majority(candidate_2, candidate_1).pro_count.should == 0
        find_majority(candidate_2, candidate_3).pro_count.should == 0
        find_majority(candidate_3, candidate_2).pro_count.should == 0
        find_majority(candidate_3, candidate_1).pro_count.should == 0
      end

      specify "it creates, updates, or destroys the associated vote as appropriate" do
        freeze_time
        users_votes = election.votes.where(:user => user)

        users_votes.should be_empty

        ranking_1 = election.rankings.create(:user => user, :candidate => candidate_1, :position => 64)

        users_votes.size.should == 1
        vote = election.votes.find(:user => user)
        ranking_1.vote.should == vote
        vote.created_at.should == Time.now
        vote.updated_at.should == Time.now

        jump(1.minute)

        ranking_2 = election.rankings.create(:user => user, :candidate => candidate_2, :position => 32)
        users_votes.size.should == 1
        ranking_2.vote.should == vote
        vote.updated_at.should == Time.now

        jump(1.minute)

        ranking_1.update(:position => 16)
        users_votes.size.should == 1
        vote.updated_at.should == Time.now

        jump(1.minute)

        ranking_2.destroy
        users_votes.size.should == 1
        vote.updated_at.should == Time.now

        ranking_1.destroy
        users_votes.should be_empty
      end
    end

    describe "security" do
      attr_reader :creator, :other_member, :ranking, :candidate
      before do
        election = Election.make
        @candidate = election.candidates.make
        @creator = make_member(candidate.election.organization)
        @other_member = make_member(candidate.election.organization)
        @ranking = Ranking.create!(:user => creator, :candidate => candidate, :position => 64)
      end

      describe "#can_create? and #can_update?" do
        it "does not allow anyone to create or update, because that is done through a custom action" do
          new_ranking = Ranking.new(:user => creator, :candidate => candidate, :position => 64)

          set_current_user(other_member)
          new_ranking.can_create?.should be_false
          ranking.can_update?.should be_false

          set_current_user(creator)
          new_ranking.can_create?.should be_false
          ranking.can_update?.should be_false
        end
      end

      describe "#can_destroy?" do
        it "only allows the user who created the ranking to destroy it" do
          set_current_user(other_member)
          ranking.can_destroy?.should be_false

          set_current_user(creator)
          ranking.can_destroy?.should be_true
        end
      end
    end
  end
end
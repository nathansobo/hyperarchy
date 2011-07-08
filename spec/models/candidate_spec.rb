require 'spec_helper'

module Models
  describe Candidate do
    attr_reader :question, :organization, :creator, :candidate
    before do
      @question = Question.make
      @organization = question.organization
      @creator = organization.make_member
      set_current_user(creator)
      @candidate = question.candidates.make
    end

    describe "life-cycle hooks" do
      before do
        Candidate.clear
      end

      describe "before create" do
        it "assigns the creator to the Model::Record.current_user" do
          set_current_user(User.make)
          question.organization.memberships.make(:user => current_user)

          candidate = question.candidates.create(:body => "foo")
          candidate.creator.should == current_user
        end

        it "if the creator is not a member of the organization, makes them one (as long as the org is public)" do
          set_current_user(User.make)
          current_user.memberships.where(:organization => organization).should be_empty

          organization.update(:privacy => "private")
          expect do
            question.candidates.create(:body => "foo")
          end.should raise_error(SecurityError)

          organization.update(:privacy => "public")
          candidate = question.candidates.create(:body => "foo")

          current_user.memberships.where(:organization => organization).size.should == 1
        end
      end

      describe "after create" do
        def verify_majority(winner, loser, question)
          majority = Majority.find(:winner => winner, :loser => loser, :question => question)
          majority.should_not be_nil
          majority.winner_created_at.to_i.should == winner.created_at.to_i
        end

        it "creates a winning and losing majority every pairing of the created candidate with other candidates" do
          question.candidates.should be_empty

          falafel = question.candidates.make(:body => "Falafel")
          tacos = question.candidates.make(:body => "Tacos")

          verify_majority(falafel, tacos, question)
          verify_majority(tacos, falafel, question)

          fish = question.candidates.make(:body => "Fish")

          verify_majority(falafel, fish, question)
          verify_majority(tacos, fish, question)
          verify_majority(fish, falafel, question)
          verify_majority(fish, tacos, question)
        end

        it "makes the new candidate lose to every positively ranked candidate and win over every negatively ranked one, then recomputes the question results" do
          user_1 = User.make
          user_2 = User.make
          user_3 = User.make

          _3_up_0_down = question.candidates.make(:body => "3 Up - 0 Down")
          _2_up_1_down = question.candidates.make(:body => "2 Up - 1 Down")
          _1_up_2_down = question.candidates.make(:body => "1 Up - 2 Down")
          _0_up_3_down = question.candidates.make(:body => "0 Up - 3 Down")
          unranked     = question.candidates.make(:body => "Unranked")

          question.rankings.create(:user => user_1, :candidate => _3_up_0_down, :position => 64)
          question.rankings.create(:user => user_1, :candidate => _2_up_1_down, :position => 32)
          question.rankings.create(:user => user_1, :candidate => _1_up_2_down, :position => 16)
          question.rankings.create(:user => user_1, :candidate => _0_up_3_down, :position => -64)

          question.rankings.create(:user => user_2, :candidate => _3_up_0_down, :position => 64)
          question.rankings.create(:user => user_2, :candidate => _2_up_1_down, :position => 32)
          question.rankings.create(:user => user_2, :candidate => _1_up_2_down, :position => -32)
          question.rankings.create(:user => user_2, :candidate => _0_up_3_down, :position => -64)

          question.rankings.create(:user => user_3, :candidate => _3_up_0_down, :position => 64)
          question.rankings.create(:user => user_3, :candidate => _2_up_1_down, :position => -16)
          question.rankings.create(:user => user_3, :candidate => _1_up_2_down, :position => -32)
          question.rankings.create(:user => user_3, :candidate => _0_up_3_down, :position => -64)

          mock.proxy(question).compute_global_ranking
          candidate = question.candidates.make(:body => "Alpaca")
          # new candidate is tied with 'Unranked' so could go either before it or after it
          # until we handle ties, but it should be less than the negatively ranked candidates
          candidate.position.should be < 5

          find_majority(_3_up_0_down, candidate).pro_count.should == 3
          find_majority(_3_up_0_down, candidate).con_count.should == 0
          find_majority(candidate, _3_up_0_down).pro_count.should == 0
          find_majority(candidate, _3_up_0_down).con_count.should == 3

          find_majority(_2_up_1_down, candidate).pro_count.should == 2
          find_majority(_2_up_1_down, candidate).con_count.should == 1
          find_majority(candidate, _2_up_1_down).pro_count.should == 1
          find_majority(candidate, _2_up_1_down).con_count.should == 2

          find_majority(_1_up_2_down, candidate).pro_count.should == 1
          find_majority(_1_up_2_down, candidate).con_count.should == 2
          find_majority(candidate, _1_up_2_down).pro_count.should == 2
          find_majority(candidate, _1_up_2_down).con_count.should == 1

          find_majority(_0_up_3_down, candidate).pro_count.should == 0
          find_majority(_0_up_3_down, candidate).con_count.should == 3
          find_majority(candidate, _0_up_3_down).pro_count.should == 3
          find_majority(candidate, _0_up_3_down).con_count.should == 0

          find_majority(unranked, candidate).pro_count.should == 0
          find_majority(unranked, candidate).con_count.should == 0
          find_majority(candidate, unranked).pro_count.should == 0
          find_majority(candidate, unranked).con_count.should == 0
        end

        it "gives the candidate a position of 1 if they are the only candidate" do
          candidate = question.candidates.make(:body => "Only")
          question.candidates.size.should == 1
          candidate.position.should == 1
        end

        it "enqueues a SendImmediateNotification job with the candidate" do
          job_params = nil
          mock(Jobs::SendImmediateNotifications).create(is_a(Hash)) do |params|
            job_params = params
          end

          candidate = question.candidates.create!(:body => "Turkey.")
          job_params.should ==  { :class_name => "Candidate", :id => candidate.id }
        end
      end

      describe "#before_destroy" do
        it "destroys any rankings, comments, and majorities associated with the candidate, but does not change the updated_at time of associated votes" do
          user_1 = User.make
          user_2 = User.make

          candidate_1 = question.candidates.make(:body => "foo")
          candidate_2 = question.candidates.make(:body => "bar")
          comment_1 = candidate_1.comments.make
          comment_2 = candidate_1.comments.make

          freeze_time
          voting_time = Time.now

          question.rankings.create(:user => user_1, :candidate => candidate_1, :position => 64)
          question.rankings.create(:user => user_1, :candidate => candidate_2, :position => 32)
          question.rankings.create(:user => user_2, :candidate => candidate_1, :position => 32)

          Ranking.where(:candidate_id => candidate_1.id).size.should == 2
          Majority.where(:winner_id => candidate_1.id).size.should == 1
          Majority.where(:loser_id => candidate_1.id).size.should == 1
          CandidateComment.where(:candidate_id => candidate_1.id).size.should == 2

          question.votes.size.should == 2
          question.votes.each do |vote|
            vote.updated_at.should == Time.now
          end

          jump(1.minute)

          candidate_1.destroy

          Ranking.where(:candidate_id => candidate_1.id).should be_empty
          Majority.where(:winner_id => candidate_1.id).should be_empty
          Majority.where(:loser_id => candidate_1.id).should be_empty
          CandidateComment.where(:candidate_id => candidate_1.id).should be_empty

          question.votes.size.should == 1
          question.votes.first.updated_at.should == voting_time
        end
      end
    end

    describe "#users_to_notify_immediately" do
      it "returns the members of the candidate's organization who have their candidate notifaction preference set to 'immediately' " +
          "and who voted on the candidate's question and who did not create the candidate" do
        notify1 = User.make
        notify2 = User.make
        dont_notify1 = User.make
        dont_notify2 = User.make

        notify1.votes.create!(:question => question)
        notify2.votes.create!(:question => question)
        dont_notify1.votes.create!(:question => question)
        creator.votes.create!(:question => question)

        organization.memberships.make(:user => notify1, :notify_of_new_candidates => 'immediately')
        organization.memberships.make(:user => notify2, :notify_of_new_candidates => 'immediately')
        organization.memberships.make(:user => dont_notify1, :notify_of_new_candidates => 'hourly')
        organization.memberships.make(:user => dont_notify2, :notify_of_new_candidates => 'immediately')
        organization.memberships.find(:user => creator).update!(:notify_of_new_candidates => 'immediately')

        candidate.users_to_notify_immediately.all.should =~ [notify1, notify2]
      end
    end

    describe "#extra_records_for_create_events" do
      it "contains the candidate's creator" do
        candidate.extra_records_for_create_events.should == [creator]
      end
    end

    describe "security" do
      attr_reader :member, :owner, :non_member, :membership, :candidate

      before do
        @member = question.organization.make_member
        @owner = question.organization.make_owner
        @non_member = User.make
        @membership = question.organization.memberships.make(:user => member)
        @candidate = question.candidates.make(:body => "Hey you!")
      end

      describe "body length limit" do
        it "raises a security error if trying to create or update with a body longer than 140 chars" do
          long_body = "x" * 145

          expect {
            Candidate.make(:body => long_body)
          }.to raise_error(SecurityError)

          expect {
            Candidate.make.update(:body => long_body)
          }.to raise_error(SecurityError)

          candidate = Candidate.make

          # grandfathered candidates can have other properties updated, but not the body
          Prequel::DB[:candidates].filter(:id => candidate.id).update(:body => long_body)
          candidate.reload

          candidate.update(:details => "Hi") # should work
          expect {
            candidate.update(:body => long_body + "and even longer!!!")
          }.to raise_error(SecurityError)
        end
      end

      describe "#can_create?" do
        before do
          question.organization.update(:privacy => "read_only")
        end

        context "if the given question's organization is non-public" do
          specify "only members create candidates" do
            set_current_user(member)
            question.candidates.make_unsaved.can_create?.should be_true

            set_current_user(non_member)
            question.candidates.make_unsaved.can_create?.should be_false
          end
        end

        context "if the given question's organization is public" do
          before do
            question.organization.update(:privacy => "public")
          end

          specify "non-guest users can create candidates" do
            set_current_user(User.default_guest)
            question.candidates.make_unsaved.can_create?.should be_false

            set_current_user(non_member)
            question.candidates.make_unsaved.can_create?.should be_true
          end
        end
      end

      describe "#can_update? and #can_destroy?" do
        specify "only admins, organization owners, and the candidate creator can destroy it or update its body and details" do
          set_current_user(non_member)
          candidate.can_update?.should be_false
          candidate.can_destroy?.should be_false

          non_member.update!(:admin => true)
          candidate.can_update?.should be_true
          candidate.can_destroy?.should be_true

          set_current_user(member)
          candidate.can_update?.should be_false
          candidate.can_destroy?.should be_false

          set_current_user(owner)
          candidate.can_update?.should be_true
          candidate.can_destroy?.should be_true

          set_current_user(member)
          candidate.update!(:creator_id => member.id)
          candidate.can_update?.should be_true
          candidate.can_destroy?.should be_true

          # no one can update properties other than body and details
          candidate.can_update_columns?([:question_id, :creator_id, :position]).should be_false
        end
      end
    end
  end
end

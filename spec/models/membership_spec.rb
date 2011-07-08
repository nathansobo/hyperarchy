require 'spec_helper'

module Models
  describe Membership do
    attr_reader :organization, :user
    before do
      @organization = Organization.make
      @user = set_current_user(User.make)
    end

    describe "before create" do
      it "assigns last_visited to the current time" do
        freeze_time
        freeze_time
        membership = organization.memberships.make(:user => User.make)
        membership.last_visited.should == Time.now
      end
    end

    describe "security" do
      describe "#can_create?, #can_update?, #can_destroy?" do
        it "only allows admins, organization owners to modify memberships. the members themselves can update only the last_visited and email preferences columns" do
          organization = Organization.make
          member = organization.make_member
          owner = organization.make_owner
          admin = User.make(:admin => true)
          other_user = User.make

          new_membership = organization.memberships.new(:user => other_user)
          membership = organization.memberships.find(:user => member)

          set_current_user(member)
          new_membership.can_create?.should be_false
          membership.can_update?.should be_true
          membership.can_destroy?.should be_false
          membership.can_update_columns?([:role, :notify_of_new_questions, :notify_of_new_candidates]).should be_false
          membership.can_update_columns?([:last_visited]).should be_true

          set_current_user(owner)
          new_membership.can_create?.should be_true
          membership.can_update?.should be_true
          membership.can_destroy?.should be_true

          set_current_user(admin)
          new_membership.can_create?.should be_true
          membership.can_update?.should be_true
          membership.can_destroy?.should be_true
        end
      end
    end

    describe "methods supporting notifications" do
      let(:membership) { organization.memberships.make(:user => user) }
      let(:other_user) { organization.make_member }
      let(:time_of_notification) { freeze_time }

      describe "#last_notified_or_visited_at(period)" do
        describe "when the last_visited time is later than 1 period ago" do
          it "returns the time of the last visit" do
            membership.last_visited = Time.now
            membership.send(:last_notified_or_visited_at, "hourly").should == membership.last_visited
          end
        end

        describe "when the last_visited time is earlier than 1 period ago" do
          it "returns 1 period ago" do
            freeze_time
            membership.last_visited = 3.hours.ago
            membership.send(:last_notified_or_visited_at, "hourly").should == 1.hour.ago
          end
        end

        describe "when the last_visited time is nil" do
          it "returns 1 period ago, without raising an execptio" do
            freeze_time
            membership.last_visited = nil
            membership.send(:last_notified_or_visited_at, "hourly").should == 1.hour.ago
          end
        end
      end

      describe "#new_questions_in_period(period)" do
        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns questions not created by the membership's user that were created after the beginning of the last period" do
            time_travel_to(time_of_notification - 70.minutes)
            organization.questions.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            organization.questions.make(:creator => user)
            e1 = organization.questions.make(:creator => other_user)
            e2 = organization.questions.make(:creator => other_user)
            Question.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_questions_in_period('hourly').all.should =~ [e1, e2]
          end
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns questions not created by the membership's user that were created after the last visit" do
            time_travel_to(time_of_notification - 70.minutes)
            organization.questions.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            organization.questions.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            organization.questions.make(:creator => user)
            e1 = organization.questions.make(:creator => other_user)
            e2 = organization.questions.make(:creator => other_user)
            Question.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_questions_in_period('hourly').all.should =~ [e1, e2]
          end
        end
      end

      describe "#new_candidates_in_period(period)" do
        attr_reader :question_with_vote, :question_without_vote

        before do
          time_travel_to(time_of_notification - 2.hours)
          @question_without_vote = organization.questions.make(:creator => other_user)
          @question_with_vote = organization.questions.make(:creator => other_user)
          candidate_to_rank =  question_with_vote.candidates.make
          question_with_vote.rankings.create(:user => user, :candidate => candidate_to_rank, :position => 64)
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns candidates not created by the membership's user that were created after the beginning of the last period" do
            time_travel_to(time_of_notification - 70.minutes)
            question_with_vote.candidates.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            question_without_vote.candidates.make(:creator => other_user)
            c1 = question_with_vote.candidates.make(:creator => other_user)
            c2 = question_with_vote.candidates.make(:creator => other_user)
            question_with_vote.candidates.make(:creator => user)
            Candidate.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_candidates_in_period('hourly').all.should =~ [c1, c2]
          end
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns candidates not created by the membership's user that were created after the last visit" do
            time_travel_to(time_of_notification - 70.minutes)
            question_with_vote.candidates.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            question_with_vote.candidates.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            question_without_vote.candidates.make(:creator => other_user)
            c1 = question_with_vote.candidates.make(:creator => other_user)
            c2 = question_with_vote.candidates.make(:creator => other_user)
            question_with_vote.candidates.make(:creator => user)
            Candidate.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_candidates_in_period('hourly').all.should =~ [c1, c2]
          end
        end
      end

      describe "#new_comments_on_ranked_candidates_in_period(period)" do
        attr_reader :ranked_candidate, :unranked_candidate

        before do
          time_travel_to(time_of_notification - 2.hours)
          question = organization.questions.make(:creator => other_user)
          @ranked_candidate =  question.candidates.make(:creator => other_user)
          @unranked_candidate =  question.candidates.make(:creator => other_user)
          question.rankings.create(:user => user, :candidate => ranked_candidate, :position => 64)
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns comments (created after the beginning of the last period) on candidates that were ranked by the user being notified, but not created by them" do
            time_travel_to(time_of_notification - 70.minutes)
            ranked_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)

            com1 = ranked_candidate.comments.make(:creator => other_user)
            com2 = ranked_candidate.comments.make(:creator => other_user)
            unranked_candidate.comments.make(:creator => other_user)
            ranked_candidate.comments.make(:creator => user)
            CandidateComment.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_comments_on_ranked_candidates_in_period('hourly').all.should =~ [com1, com2]
          end
        end

        context "when the user last visited after the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns comments (created after the beginning of the last period) on candidates that were ranked by the user being notified, but not created by them" do
            time_travel_to(time_of_notification - 70.minutes)
            ranked_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            ranked_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            com1 = ranked_candidate.comments.make(:creator => other_user)
            com2 = ranked_candidate.comments.make(:creator => other_user)
            unranked_candidate.comments.make(:creator => other_user)
            ranked_candidate.comments.make(:creator => user)
            CandidateComment.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_comments_on_ranked_candidates_in_period('hourly').all.should =~ [com1, com2]
          end
        end
      end

      describe "#new_comments_on_own_candidates_in_period(period)" do
        attr_reader :own_candidate, :other_candidate

        before do
          time_travel_to(time_of_notification - 2.hours)
          question = organization.questions.make(:creator => other_user)
          @own_candidate =  question.candidates.make(:creator => user)
          @other_candidate =  question.candidates.make(:creator => other_user)
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns comments (created by someone other than the notified user after the beginning of the last period) on candidates that were created by the user being notified" do
            time_travel_to(time_of_notification - 70.minutes)
            own_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)

            com1 = own_candidate.comments.make(:creator => other_user)
            com2 = own_candidate.comments.make(:creator => other_user)
            other_candidate.comments.make(:creator => other_user)
            own_candidate.comments.make(:creator => user)
            CandidateComment.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)

            membership.new_comments_on_own_candidates_in_period('hourly').all.should =~ [com1, com2]
          end
        end

        context "when the user last visited after the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns comments (created by someone other than the notified user after the beginning of the last visit) on candidates that were created by the user being notified" do
            time_travel_to(time_of_notification - 70.minutes)
            own_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            own_candidate.comments.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            com1 = own_candidate.comments.make(:creator => other_user)
            com2 = own_candidate.comments.make(:creator => other_user)
            other_candidate.comments.make(:creator => other_user)
            own_candidate.comments.make(:creator => user)
            CandidateComment.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)

            membership.new_comments_on_own_candidates_in_period('hourly').all.should =~ [com1, com2]
          end
        end
      end
    end
  end
end

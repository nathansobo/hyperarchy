require 'spec_helper'

module Models
  describe Question do
    attr_reader :question, :organization, :creator, :memphis, :knoxville, :chattanooga, :nashville, :unranked

    before do
      freeze_time

      @organization = Organization.make
      @creator = organization.make_member
      @question = organization.questions.make(:body => "Where should the capital of Tennesee be?", :creator => creator)
      @memphis = question.answers.make(:body => "Memphis")
      @knoxville = question.answers.make(:body => "Knoxville")
      @chattanooga = question.answers.make(:body => "Chattanooga")
      @nashville = question.answers.make(:body => "Nashville")
      @unranked = question.answers.make(:body => "Unranked")
    end


    describe ".update_scores" do
      it "causes scores to go down as time passes" do
        initial_score = question.score

        question.update(:created_at => 1.hour.ago)
        Question.update_scores
        
        question.reload.score.should be < initial_score
      end

      it "causes scores to go up as votes are added" do
        initial_score = question.score

        question.update(:vote_count => 10)
        Question.update_scores
        
        question.reload.score.should be > initial_score
      end
    end

    describe "before create" do
      it "if the creator is not a member of the question's organization, makes them one (as long as the org is public)" do
        set_current_user(User.make)
        current_user.memberships.where(:organization => organization).should be_empty

        organization.update(:privacy => "private")
        expect do
          organization.questions.create!(:body => "foo")
        end.should raise_error(SecurityError)

        organization.update(:privacy => "public")
        organization.questions.create!(:body => "foo")

        current_user.memberships.where(:organization => organization).size.should == 1
      end

      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make)
        question = Question.make
        question.creator.should == current_user
      end

      it "assigns a score" do
        question.score.should_not be_nil
      end
    end

    describe "after create" do
      attr_reader :organization, :creator, :opted_in, :opted_out, :non_member

      before do
        @organization = Organization.make
        @creator = User.make
        @opted_in = User.make
        @opted_out = User.make
        @non_member = User.make

        organization.memberships.make(:user => creator, :notify_of_new_questions => "immediately")
        organization.memberships.make(:user => opted_in, :notify_of_new_questions => "immediately")
        organization.memberships.make(:user => opted_out, :notify_of_new_questions => "never")

        set_current_user(creator)
      end

      it "enqueues a SendImmediateNotification job with the question" do
        job_params = nil
        mock(Jobs::SendImmediateNotifications).create(is_a(Hash)) do |params|
          job_params = params
        end
        
        question = organization.questions.create!(:body => "What should we eat for dinner?")
        job_params.should ==  { :class_name => "Question", :id => question.id }
      end

      it "increments the question count on its organization" do
        lambda do
          organization.questions.create!(:body => "What should we eat for dinner?")
        end.should change { organization.question_count }.by(1)
      end
    end

    describe "before update" do
      it "updates the score if the vote count changed" do
        score_before = question.score
        question.vote_count += 1
        question.save
        question.score.should be > score_before
      end
    end

    describe "before destroy" do
      it "destroys any answers, answer comments, votes and visits that belong to the question" do
        question = Question.make
        user_1 = question.organization.make_member
        user_2 = question.organization.make_member
        answer_1 = question.answers.make
        answer_2 = question.answers.make
        answer_1.comments.make
        answer_2.comments.make

        Ranking.create!(:user => user_1, :answer => answer_1, :position => 64)
        Ranking.create!(:user => user_1, :answer => answer_2, :position => 32)
        Ranking.create!(:user => user_2, :answer => answer_1, :position => 64)
        question.question_visits.create!(:user => user_1)

        question.question_visits.size.should == 1
        question.answers.size.should == 2
        question.votes.size.should == 2
        question.answers.join_through(AnswerComment).size.should == 2
        question.destroy
        question.answers.should be_empty
        question.votes.should be_empty
        question.question_visits.should be_empty
        question.answers.join_through(AnswerComment).should be_empty
      end
    end

    describe "after destroy" do
      it "decrements the question count on its organization" do
        question = Question.make
        lambda do
          question.destroy
        end.should change { question.organization.question_count }.by(-1)
      end
    end

    describe "#compute_global_ranking" do
      it "uses the ranked-pairs algoritm to produce a global ranking, assigning a position of null to any unranked answers" do
        jump(1.minute)

        4.times do
          user = User.make
          question.rankings.create(:user => user, :answer => memphis, :position => 4)
          question.rankings.create(:user => user, :answer => nashville, :position => 3)
          question.rankings.create(:user => user, :answer => chattanooga, :position => 2)
          question.rankings.create(:user => user, :answer => knoxville, :position => 1)
        end

        3.times do
          user = User.make
          question.rankings.create(:user => user, :answer => nashville, :position => 4)
          question.rankings.create(:user => user, :answer => chattanooga, :position => 3)
          question.rankings.create(:user => user, :answer => knoxville, :position => 2)
          question.rankings.create(:user => user, :answer => memphis, :position => 1)
        end

        1.times do
          user = User.make
          question.rankings.create(:user => user, :answer => chattanooga, :position => 4)
          question.rankings.create(:user => user, :answer => knoxville, :position => 3)
          question.rankings.create(:user => user, :answer => nashville, :position => 2)
          question.rankings.create(:user => user, :answer => memphis, :position => 1)
        end

        2.times do
          user = User.make
          question.rankings.create(:user => user, :answer => knoxville, :position => 4)
          question.rankings.create(:user => user, :answer => chattanooga, :position => 3)
          question.rankings.create(:user => user, :answer => nashville, :position => 2)
          question.rankings.create(:user => user, :answer => memphis, :position => 1)
        end

        question.compute_global_ranking

        nashville.reload.position.should == 1
        chattanooga.position.should == 2
        knoxville.position.should == 3
        memphis.position.should == 4
        unranked.position.should == 5

        question.updated_at.to_i.should == Time.now.to_i
      end
    end

    describe "#users_to_notify_immediately" do
      it "includes members of the organization that have their question notification preference set to immediately and are not the creator of the question" do
        notify1 = User.make
        notify2 = User.make
        dont_notify = User.make

        organization.memberships.make(:user => notify1, :notify_of_new_questions => 'immediately')
        organization.memberships.make(:user => notify2, :notify_of_new_questions => 'immediately')
        organization.memberships.make(:user => dont_notify, :notify_of_new_questions => 'hourly')
        organization.memberships.find(:user => creator).update!(:notify_of_new_questions => 'immediately')

        question.users_to_notify_immediately.all.should =~ [notify1, notify2]
      end
    end

    describe "security" do
      attr_reader :organization, :member, :owner, :admin, :non_member

      before do
        @organization = Organization.make
        @member = organization.make_member
        @owner = organization.make_owner
        @admin = User.make(:admin => true)
        @non_member = User.make
      end

      describe "body length limit" do
        it "raises a security error if trying to create or update with a body longer than 140 chars" do
          long_body = "x" * 145

          expect {
            Question.make(:body => long_body)
          }.to raise_error(SecurityError)

          expect {
            Question.make.update(:body => long_body)
          }.to raise_error(SecurityError)

          question = Question.make

          # grandfathered questions can have other properties updated, but not the body
          Prequel::DB[:questions].filter(:id => question.id).update(:body => long_body)
          question.reload

          question.update(:details => "Hi") # should work
          expect {
            question.update(:body => long_body + "and even longer!!!")
          }.to raise_error(SecurityError)
        end
      end

      describe "#can_create?" do
        before do
          @question = organization.questions.make_unsaved
        end

        context "if the question's organization is non-public" do
          before do
            question.organization.update(:privacy => "read_only")
          end

          specify "only members create answers" do
            set_current_user(member)
            question.can_create?.should be_true

            set_current_user(non_member)
            question.can_create?.should be_false
          end
        end

        context "if the given question's organization is public" do
          before do
            question.organization.update(:privacy => "public")
          end

          specify "non-guest users can create answers" do
            set_current_user(User.default_guest)
            question.can_create?.should be_false

            set_current_user(non_member)
            question.can_create?.should be_true
          end
        end
      end

      describe "#can_update? and #can_destroy?" do
        it "only allows admins, organization owners, and the creator of the question itself to update or destroy it" do
          other_member = set_current_user(User.make)
          organization.memberships.create!(:user => other_member)
          question = organization.questions.create!(:body => "What should we do?")

          set_current_user(member)
          question.can_update?.should be_false
          question.can_destroy?.should be_false


          set_current_user(other_member)
          question.can_update?.should be_true
          question.can_destroy?.should be_true

          set_current_user(owner)
          question.can_update?.should be_true
          question.can_destroy?.should be_true

          set_current_user(admin)
          question.can_update?.should be_true
          question.can_destroy?.should be_true
        end
      end
    end
  end
end

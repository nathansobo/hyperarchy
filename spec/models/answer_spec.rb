require 'spec_helper'

module Models
  describe Answer do
    attr_reader :question, :creator, :answer
    before do
      @question = Question.make!
      @creator = User.make!
      set_current_user(creator)
    end

    describe "life-cycle hooks" do
      before do
        Answer.clear
      end

      describe "before create" do
        it "assigns the creator to the Model::Record.current_user" do
          answer = question.answers.create(:body => "foo")
          answer.creator.should == creator
        end
      end

      describe "after create" do
        def verify_majority(winner, loser, question)
          majority = Majority.find(:winner => winner, :loser => loser, :question => question)
          majority.should_not be_nil
          majority.winner_created_at.to_i.should == winner.created_at.to_i
        end

        it "creates a winning and losing majority every pairing of the created answer with other answers" do
          question.answers.should be_empty

          falafel = question.answers.make!(:body => "Falafel")
          tacos = question.answers.make!(:body => "Tacos")

          verify_majority(falafel, tacos, question)
          verify_majority(tacos, falafel, question)

          fish = question.answers.make!(:body => "Fish")

          verify_majority(falafel, fish, question)
          verify_majority(tacos, fish, question)
          verify_majority(fish, falafel, question)
          verify_majority(fish, tacos, question)
        end

        it "makes the new answer lose to every positively ranked answer and win over every negatively ranked one, then recomputes the question results" do
          user_1 = User.make!
          user_2 = User.make!
          user_3 = User.make!

          _3_up_0_down = question.answers.make!(:body => "3 Up - 0 Down")
          _2_up_1_down = question.answers.make!(:body => "2 Up - 1 Down")
          _1_up_2_down = question.answers.make!(:body => "1 Up - 2 Down")
          _0_up_3_down = question.answers.make!(:body => "0 Up - 3 Down")
          unranked     = question.answers.make!(:body => "Unranked")

          question.preferences.create(:user => user_1, :answer => _3_up_0_down, :position => 64)
          question.preferences.create(:user => user_1, :answer => _2_up_1_down, :position => 32)
          question.preferences.create(:user => user_1, :answer => _1_up_2_down, :position => 16)
          question.preferences.create(:user => user_1, :answer => _0_up_3_down, :position => -64)

          question.preferences.create(:user => user_2, :answer => _3_up_0_down, :position => 64)
          question.preferences.create(:user => user_2, :answer => _2_up_1_down, :position => 32)
          question.preferences.create(:user => user_2, :answer => _1_up_2_down, :position => -32)
          question.preferences.create(:user => user_2, :answer => _0_up_3_down, :position => -64)

          question.preferences.create(:user => user_3, :answer => _3_up_0_down, :position => 64)
          question.preferences.create(:user => user_3, :answer => _2_up_1_down, :position => -16)
          question.preferences.create(:user => user_3, :answer => _1_up_2_down, :position => -32)
          question.preferences.create(:user => user_3, :answer => _0_up_3_down, :position => -64)

          mock.proxy(question).compute_global_ranking
          answer = question.answers.make!(:body => "Alpaca")
          # new answer is tied with 'Unranked' so could go either before it or after it
          # until we handle ties, but it should be less than the negatively ranked answers
          answer.position.should be < 5

          find_majority(_3_up_0_down, answer).pro_count.should == 3
          find_majority(_3_up_0_down, answer).con_count.should == 0
          find_majority(answer, _3_up_0_down).pro_count.should == 0
          find_majority(answer, _3_up_0_down).con_count.should == 3

          find_majority(_2_up_1_down, answer).pro_count.should == 2
          find_majority(_2_up_1_down, answer).con_count.should == 1
          find_majority(answer, _2_up_1_down).pro_count.should == 1
          find_majority(answer, _2_up_1_down).con_count.should == 2

          find_majority(_1_up_2_down, answer).pro_count.should == 1
          find_majority(_1_up_2_down, answer).con_count.should == 2
          find_majority(answer, _1_up_2_down).pro_count.should == 2
          find_majority(answer, _1_up_2_down).con_count.should == 1

          find_majority(_0_up_3_down, answer).pro_count.should == 0
          find_majority(_0_up_3_down, answer).con_count.should == 3
          find_majority(answer, _0_up_3_down).pro_count.should == 3
          find_majority(answer, _0_up_3_down).con_count.should == 0

          find_majority(unranked, answer).pro_count.should == 0
          find_majority(unranked, answer).con_count.should == 0
          find_majority(answer, unranked).pro_count.should == 0
          find_majority(answer, unranked).con_count.should == 0
        end

        it "gives the answer a position of 1 if they are the only answer" do
          answer = question.answers.make!(:body => "Only")
          question.answers.size.should == 1
          answer.position.should == 1
        end
      end

      describe "#before_destroy" do
        it "destroys any preferences and majorities associated with the answer, but does not change the updated_at time of associated votes" do
          user_1 = User.make!
          user_2 = User.make!

          answer_1 = question.answers.make!(:body => "foo")
          answer_2 = question.answers.make!(:body => "bar")

          freeze_time
          voting_time = Time.now

          question.preferences.create(:user => user_1, :answer => answer_1, :position => 64)
          question.preferences.create(:user => user_1, :answer => answer_2, :position => 32)
          question.preferences.create(:user => user_2, :answer => answer_1, :position => 32)

          Preference.where(:answer_id => answer_1.id).size.should == 2
          Majority.where(:winner_id => answer_1.id).size.should == 1
          Majority.where(:loser_id => answer_1.id).size.should == 1

          question.votes.size.should == 2
          question.votes.each do |vote|
            vote.updated_at.should == Time.now
          end

          jump(1.minute)

          answer_1.destroy

          Preference.where(:answer_id => answer_1.id).should be_empty
          Majority.where(:winner_id => answer_1.id).should be_empty
          Majority.where(:loser_id => answer_1.id).should be_empty

          question.votes.size.should == 1
          question.votes.first.updated_at.should == voting_time
        end
      end
    end

    describe "#extra_records_for_create_events" do
      it "contains the answer's creator" do
        answer = Answer.make!
        answer.extra_records_for_create_events.should == [creator]
      end
    end

    describe "security" do
      attr_reader :non_owner

      before do
        @non_owner = User.make!
        @answer = question.answers.make(:body => "Hey you!")
      end

      describe "body length limit" do
        it "raises a security error if trying to create or update with a body longer than 140 chars" do
          long_body = "x" * 145

          expect {
            Answer.make!(:body => long_body)
          }.to raise_error(SecurityError)

          expect {
            Answer.make!.update(:body => long_body)
          }.to raise_error(SecurityError)
        end
      end

      describe "#can_update? and #can_destroy?" do
        specify "only the answer creator can destroy it or update its body and details" do
          answer = Answer.make!
          answer.creator.should == creator

          set_current_user(non_owner)
          answer.can_update?.should be_false
          answer.can_destroy?.should be_false

          set_current_user(creator)
          answer.can_update?.should be_true
          answer.can_destroy?.should be_true

          # no one can update properties other than body and details
          answer.can_update_columns?([:question_id, :creator_id, :position]).should be_false
        end
      end
    end
  end
end

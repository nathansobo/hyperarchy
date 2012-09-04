require 'spec_helper'

module Models
  describe Question do
    attr_reader :question, :organization, :creator, :memphis, :knoxville, :chattanooga, :nashville, :unranked

    before do
      freeze_time

      @creator = User.make!
      @question = Question.make!(:body => "Where should the capital of Tennesee be?", :creator => creator)
      @memphis = question.answers.make!(:body => "Memphis")
      @knoxville = question.answers.make!(:body => "Knoxville")
      @chattanooga = question.answers.make!(:body => "Chattanooga")
      @nashville = question.answers.make!(:body => "Nashville")
      @unranked = question.answers.make!(:body => "Unranked")
    end

    describe "before create" do
      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make!)
        question = Question.make!
        question.creator.should == current_user
      end
    end

    describe "before destroy" do
      it "destroys any answers and votes that belong to the question" do
        question = Question.make!
        user_1 = User.make!
        user_2 = User.make!
        answer_1 = question.answers.make!
        answer_2 = question.answers.make!

        Ranking.create!(:user => user_1, :answer => answer_1, :position => 64)
        Ranking.create!(:user => user_1, :answer => answer_2, :position => 32)
        Ranking.create!(:user => user_2, :answer => answer_1, :position => 64)

        question.answers.size.should == 2
        question.votes.size.should == 2
        question.destroy
        question.answers.should be_empty
        question.votes.should be_empty
      end
    end

    describe "#compute_global_ranking" do
      it "uses the ranked-pairs algoritm to produce a global ranking, assigning a position of null to any unranked answers" do
        jump(1.minute)

        4.times do
          user = User.make!
          question.rankings.create(:user => user, :answer => memphis, :position => 4)
          question.rankings.create(:user => user, :answer => nashville, :position => 3)
          question.rankings.create(:user => user, :answer => chattanooga, :position => 2)
          question.rankings.create(:user => user, :answer => knoxville, :position => 1)
        end

        3.times do
          user = User.make!
          question.rankings.create(:user => user, :answer => nashville, :position => 4)
          question.rankings.create(:user => user, :answer => chattanooga, :position => 3)
          question.rankings.create(:user => user, :answer => knoxville, :position => 2)
          question.rankings.create(:user => user, :answer => memphis, :position => 1)
        end

        1.times do
          user = User.make!
          question.rankings.create(:user => user, :answer => chattanooga, :position => 4)
          question.rankings.create(:user => user, :answer => knoxville, :position => 3)
          question.rankings.create(:user => user, :answer => nashville, :position => 2)
          question.rankings.create(:user => user, :answer => memphis, :position => 1)
        end

        2.times do
          user = User.make!
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

    describe "security" do
      attr_reader :non_owner

      before do
        @non_owner = User.make
      end

      describe "body length limit" do
        it "raises a security error if trying to create or update with a body longer than 140 chars" do
          long_body = "x" * 145

          expect {
            Question.make!(:body => long_body)
          }.to raise_error(SecurityError)

          expect {
            Question.make!.update(:body => long_body)
          }.to raise_error(SecurityError)
        end
      end

      describe "#can_update? and #can_destroy?" do
        it "only allows the creator of the question itself to update or destroy it" do
          other_user = User.make!

          set_current_user(other_user)
          question.can_update?.should be_false
          question.can_destroy?.should be_false


          set_current_user(creator)
          question.can_update?.should be_true
          question.can_destroy?.should be_true
        end
      end
    end
  end
end

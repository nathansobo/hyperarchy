require 'spec_helper'

module Models
  describe AnswerComment do
    attr_reader :answer, :organization, :answer_creator, :comment_creator, :comment
    before do
      @organization = Organization.make
      question = organization.questions.make
      @answer_creator = organization.make_member
      @comment_creator = organization.make_member
      set_current_user(comment_creator)
      @answer = question.answers.make(:creator => answer_creator)
      @comment = answer.comments.make(:creator => comment_creator)
    end
    
    describe "before create" do
      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make)
        organization.memberships.make(:user => current_user)
        comment = answer.comments.create!(:body => "Terrible terrible answer", :suppress_immediate_notifications => true)
        comment.creator.should == current_user
      end

      it "if the creator is not a member of the organization, makes them one (as long as the org is public)" do
        set_current_user(User.make)
        current_user.memberships.where(:organization => organization).should be_empty

        organization.update(:privacy => "private")
        expect do
          answer.comments.create!(:body => "foo")
        end.should raise_error(SecurityError)

        organization.update(:privacy => "public")
        answer.comments.create!(:body => "foo")

        current_user.memberships.where(:organization => organization).size.should == 1
      end
    end

    describe "after create" do
      it "enqueues a SendImmediateNotification job with the comment" do
        job_params = nil
        mock(Jobs::SendImmediateNotifications).create(is_a(Hash)) do |params|
          job_params = params
        end

        comment = answer.comments.create!(:body => "Bullshit.")
        job_params.should ==  { :class_name => "AnswerComment", :id => comment.id }
      end

      it "increments the answer's comment_count" do
        expect {
          answer.comments.make(:creator => comment_creator)
        }.to change(answer, :comment_count).by(1)
      end
    end

    describe "after destroy" do
      it "decrements the answer's comment_count" do
        expect {
          comment.destroy
        }.to change(answer, :comment_count).by(-1)
      end
    end

    describe "#users_to_notify_immediately" do
      it "returns the members of the answer's organization who either" +
          "- have voted on the answer and have :notify_of_new_comments_on_ranked_answers set to 'immediately'" +
          "- created the answer and have :notify_of_new_comments_on_own_answers set to 'immediately'" do
        notify1 = User.make
        notify2 = User.make
        dont_notify = User.make

        notify1.rankings.create!(:answer => answer, :position => 64)
        notify2.rankings.create!(:answer => answer, :position => 64)
        dont_notify.rankings.create!(:answer => answer, :position => 64)
        comment_creator.rankings.create!(:answer => answer, :position => 64)

        organization.memberships.make(:user => notify1, :notify_of_new_comments_on_ranked_answers => 'immediately')
        organization.memberships.make(:user => notify2, :notify_of_new_comments_on_ranked_answers => 'immediately')
        organization.memberships.make(:user => dont_notify, :notify_of_new_comments_on_ranked_answers => 'hourly')
        organization.memberships.find(:user => answer_creator).update!(:notify_of_new_comments_on_own_answers => 'immediately')
        organization.memberships.find(:user => comment_creator).update!(:notify_of_new_comments_on_ranked_answers => 'immediately')
        comment.users_to_notify_immediately.all.should =~ [notify1, notify2, answer_creator]

        organization.memberships.find(:user => answer_creator).update!(:notify_of_new_comments_on_own_answers => 'hourly')
        comment.users_to_notify_immediately.all.should =~ [notify1, notify2]
      end
    end

    describe "security" do
      describe "#can_create?" do
        attr_reader :comment
        before do
          @comment = answer.comments.make_unsaved
        end

        context "if the organization is public" do
          before do
            organization.update(:privacy => "public")
          end

          it "returns true if the current user is not a guest" do
            set_current_user(User.default_guest)
            comment.can_create?.should be_false

            set_current_user(User.make)
            comment.can_create?.should be_true
          end
        end

        context "if the organization is not public" do
          before do
            organization.update(:privacy => "read_only")
          end

          it "returns true only if the current user is a member of the organization" do
            set_current_user(User.make)
            comment.can_create?.should be_false

            organization.memberships.make(:user => current_user)
            comment.can_create?.should be_true
          end
        end
      end
    end
  end
end
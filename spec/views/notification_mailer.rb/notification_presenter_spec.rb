require 'spec_helper'

module Views
  module NotificationMailer
    describe NotificationPresenter do
      describe "when presenting a periodic notification" do
        attr_reader :org1, :org1_e1, :org1_e1_c1, :org1_e1_c1_comment, :org1_e1_c2, :org1_e2, :org1_e2_c1,
                    :org1_e2_c1_comment, :org2, :org2_e1, :org2_e1_c1, :org2_e1_c1_comment,
                    :user, :membership1, :membership2

        before do
          @org1 = Organization.make(:name => "Org 1")
          @org1_e1 = org1.questions.make(:body => "Org 1 Question 1")
          @org1_e1_c1 = org1_e1.answers.make(:body => "Org 1 Question 1 Answer 1")
          @org1_e1_c1_comment = org1_e1_c1.comments.make(:body => "Org 1 Question 1 Answer 1 Comment")
          @org1_e1_c2 = org1_e1.answers.make(:body => "Org 1 Question 1 Answer 2")
          @org1_e2 = org1.questions.make(:body => "Org 1 Question 2")
          @org1_e2_c1 = org1_e2.answers.make(:body => "Org 1 Question 2 Answer 1")
          @org1_e2_c1_comment = org1_e2_c1.comments.make(:body => "Org 1 Question 2 Answer 1 Comment")

          @org2 = Organization.make(:name => "Org 2")
          @org2_e1 = org2.questions.make(:body => "Org 2 Question 1")
          @org2_e1_c1 = org2_e1.answers.make(:body => "Org 2 Question 1 Answer 1")
          @org2_e1_c1_comment = org2_e1_c1.comments.make(:body => "Org 2 Question 1 Answer 1 Comment")

          @user = User.make
          @membership1 = org1.memberships.make(:user => user, :all_notifications => 'hourly')
          @membership2 = org2.memberships.make(:user => user, :all_notifications => 'hourly')

          mock(user).memberships_to_notify('hourly') { [membership1, membership2] }

          mock(membership1).new_questions_in_period('hourly') { [org1_e1] }
          mock(membership1).new_answers_in_period('hourly') { [org1_e1_c1, org1_e2_c1] }
          mock(membership1).new_comments_on_ranked_answers_in_period('hourly') { [org1_e1_c1_comment, org1_e2_c1_comment ] }
          mock(membership1).new_comments_on_own_answers_in_period('hourly') { [] }

          mock(membership2).new_questions_in_period('hourly') { [] }
          mock(membership2).new_answers_in_period('hourly') { [] }
          mock(membership2).new_comments_on_ranked_answers_in_period('hourly') { [] }
          mock(membership2).new_comments_on_own_answers_in_period('hourly') { [org2_e1_c1_comment] }
        end

        it "for each of the user's memberships appropriate for the notification period, hierarchically organizes the questions, answers, and comments" do
          presenter = NotificationPresenter.new(user, 'hourly')

          presenter.membership_presenters.size.should == 2

          membership1_presenter = presenter.membership_presenters[0]
          membership1_presenter.membership.should == membership1

          membership1_presenter.question_presenters.size.should == 2

          org1_e1_presenter = membership1_presenter.question_presenters.find {|ep| ep.question == org1_e1}
          org1_e1_presenter.answer_presenters.size.should == 2

          org1_e1_c1_presenter = org1_e1_presenter.answer_presenters.find {|cp| cp.answer == org1_e1_c1}
          org1_e1_c1_presenter.new_comments.should == [org1_e1_c1_comment]

          org1_e1_c2_presenter = org1_e1_presenter.answer_presenters.find {|cp| cp.answer == org1_e1_c2}
          org1_e1_c2_presenter.new_comments.should be_empty

          membership2_presenter = presenter.membership_presenters[1]
          membership2_presenter.question_presenters.size.should == 1
          org2_e1_presenter = membership2_presenter.question_presenters.first
          org2_e1_presenter.answer_presenters.size.should == 1
          org2_e1_c1_presenter = org2_e1_presenter.answer_presenters.first
          org2_e1_c1_presenter.new_comments.should == [org2_e1_c1_comment]
        end
      end

      describe "when presenting an immediate notification" do
        let(:organization) { Organization.make }
        let(:user) { organization.make_member }
        let(:presenter) { NotificationPresenter.new(user, 'immediately', item) }
        let(:question) { organization.questions.make }
        let(:answer) { question.answers.make }
        let(:answer_comment) { answer.comments.make }


        describe "when notifying of an question" do
          let(:item) { question }

          it "includes the comment in the question hierarchy of objects" do
            presenter.membership_presenters.size.should == 1
            membership_presenter = presenter.membership_presenters.first
            membership_presenter.membership.organization.should == organization
            membership_presenter.membership.user.should == user
            membership_presenter.question_presenters.size.should == 1
            membership_presenter.question_presenters.first.question.should == question
          end
        end

        describe "when notifying of a answer" do
          let(:item) { answer }

          it "includes the comment in the answer hierarchy of objects" do
            presenter.membership_presenters.size.should == 1
            membership_presenter = presenter.membership_presenters.first
            membership_presenter.membership.organization.should == organization
            membership_presenter.membership.user.should == user
            membership_presenter.question_presenters.size.should == 1
            question_presenter = membership_presenter.question_presenters.first
            question_presenter.question.should == question
            question_presenter.answer_presenters.size.should == 1
            question_presenter.answer_presenters.first.answer.should == answer
          end
        end

        describe "when notifying of a answer comment" do
          let(:item) { answer_comment }

          it "includes the comment in the correct hierarchy of objects" do
            presenter.membership_presenters.size.should == 1
            membership_presenter = presenter.membership_presenters.first
            membership_presenter.membership.organization.should == organization
            membership_presenter.membership.user.should == user
            membership_presenter.question_presenters.size.should == 1
            question_presenter = membership_presenter.question_presenters.first
            question_presenter.question.should == question
            question_presenter.answer_presenters.size.should == 1
            answer_presenter = question_presenter.answer_presenters.first
            answer_presenter.answer.should == answer
            answer_presenter.new_comments.size.should == 1
            answer_presenter.new_comments.first.should == answer_comment
          end
        end
      end
    end
  end
end
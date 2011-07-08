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
          @org1_e1_c1 = org1_e1.candidates.make(:body => "Org 1 Question 1 Candidate 1")
          @org1_e1_c1_comment = org1_e1_c1.comments.make(:body => "Org 1 Question 1 Candidate 1 Comment")
          @org1_e1_c2 = org1_e1.candidates.make(:body => "Org 1 Question 1 Candidate 2")
          @org1_e2 = org1.questions.make(:body => "Org 1 Question 2")
          @org1_e2_c1 = org1_e2.candidates.make(:body => "Org 1 Question 2 Candidate 1")
          @org1_e2_c1_comment = org1_e2_c1.comments.make(:body => "Org 1 Question 2 Candidate 1 Comment")

          @org2 = Organization.make(:name => "Org 2")
          @org2_e1 = org2.questions.make(:body => "Org 2 Question 1")
          @org2_e1_c1 = org2_e1.candidates.make(:body => "Org 2 Question 1 Candidate 1")
          @org2_e1_c1_comment = org2_e1_c1.comments.make(:body => "Org 2 Question 1 Candidate 1 Comment")

          @user = User.make
          @membership1 = org1.memberships.make(:user => user, :all_notifications => 'hourly')
          @membership2 = org2.memberships.make(:user => user, :all_notifications => 'hourly')

          mock(user).memberships_to_notify('hourly') { [membership1, membership2] }

          mock(membership1).new_questions_in_period('hourly') { [org1_e1] }
          mock(membership1).new_candidates_in_period('hourly') { [org1_e1_c1, org1_e2_c1] }
          mock(membership1).new_comments_on_ranked_candidates_in_period('hourly') { [org1_e1_c1_comment, org1_e2_c1_comment ] }
          mock(membership1).new_comments_on_own_candidates_in_period('hourly') { [] }

          mock(membership2).new_questions_in_period('hourly') { [] }
          mock(membership2).new_candidates_in_period('hourly') { [] }
          mock(membership2).new_comments_on_ranked_candidates_in_period('hourly') { [] }
          mock(membership2).new_comments_on_own_candidates_in_period('hourly') { [org2_e1_c1_comment] }
        end

        it "for each of the user's memberships appropriate for the notification period, hierarchically organizes the questions, candidates, and comments" do
          presenter = NotificationPresenter.new(user, 'hourly')

          presenter.membership_presenters.size.should == 2

          membership1_presenter = presenter.membership_presenters[0]
          membership1_presenter.membership.should == membership1

          membership1_presenter.question_presenters.size.should == 2

          org1_e1_presenter = membership1_presenter.question_presenters.find {|ep| ep.question == org1_e1}
          org1_e1_presenter.candidate_presenters.size.should == 2

          org1_e1_c1_presenter = org1_e1_presenter.candidate_presenters.find {|cp| cp.candidate == org1_e1_c1}
          org1_e1_c1_presenter.new_comments.should == [org1_e1_c1_comment]

          org1_e1_c2_presenter = org1_e1_presenter.candidate_presenters.find {|cp| cp.candidate == org1_e1_c2}
          org1_e1_c2_presenter.new_comments.should be_empty

          membership2_presenter = presenter.membership_presenters[1]
          membership2_presenter.question_presenters.size.should == 1
          org2_e1_presenter = membership2_presenter.question_presenters.first
          org2_e1_presenter.candidate_presenters.size.should == 1
          org2_e1_c1_presenter = org2_e1_presenter.candidate_presenters.first
          org2_e1_c1_presenter.new_comments.should == [org2_e1_c1_comment]
        end
      end

      describe "when presenting an immediate notification" do
        let(:organization) { Organization.make }
        let(:user) { organization.make_member }
        let(:presenter) { NotificationPresenter.new(user, 'immediately', item) }
        let(:question) { organization.questions.make }
        let(:candidate) { question.candidates.make }
        let(:candidate_comment) { candidate.comments.make }


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

        describe "when notifying of a candidate" do
          let(:item) { candidate }

          it "includes the comment in the candidate hierarchy of objects" do
            presenter.membership_presenters.size.should == 1
            membership_presenter = presenter.membership_presenters.first
            membership_presenter.membership.organization.should == organization
            membership_presenter.membership.user.should == user
            membership_presenter.question_presenters.size.should == 1
            question_presenter = membership_presenter.question_presenters.first
            question_presenter.question.should == question
            question_presenter.candidate_presenters.size.should == 1
            question_presenter.candidate_presenters.first.candidate.should == candidate
          end
        end

        describe "when notifying of a candidate comment" do
          let(:item) { candidate_comment }

          it "includes the comment in the correct hierarchy of objects" do
            presenter.membership_presenters.size.should == 1
            membership_presenter = presenter.membership_presenters.first
            membership_presenter.membership.organization.should == organization
            membership_presenter.membership.user.should == user
            membership_presenter.question_presenters.size.should == 1
            question_presenter = membership_presenter.question_presenters.first
            question_presenter.question.should == question
            question_presenter.candidate_presenters.size.should == 1
            candidate_presenter = question_presenter.candidate_presenters.first
            candidate_presenter.candidate.should == candidate
            candidate_presenter.new_comments.size.should == 1
            candidate_presenter.new_comments.first.should == candidate_comment
          end
        end
      end
    end
  end
end
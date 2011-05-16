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
          @org1_e1 = org1.elections.make(:body => "Org 1 Election 1")
          @org1_e1_c1 = org1_e1.candidates.make(:body => "Org 1 Election 1 Candidate 1")
          @org1_e1_c1_comment = org1_e1_c1.comments.make(:body => "Org 1 Election 1 Candidate 1 Comment")
          @org1_e1_c2 = org1_e1.candidates.make(:body => "Org 1 Election 1 Candidate 2")
          @org1_e2 = org1.elections.make(:body => "Org 1 Election 2")
          @org1_e2_c1 = org1_e2.candidates.make(:body => "Org 1 Election 2 Candidate 1")
          @org1_e2_c1_comment = org1_e2_c1.comments.make(:body => "Org 1 Election 2 Candidate 1 Comment")

          @org2 = Organization.make(:name => "Org 2")
          @org2_e1 = org2.elections.make(:body => "Org 2 Election 1")
          @org2_e1_c1 = org2_e1.candidates.make(:body => "Org 2 Election 1 Candidate 1")
          @org2_e1_c1_comment = org2_e1_c1.comments.make(:body => "Org 2 Election 1 Candidate 1 Comment")

          @user = User.make
          @membership1 = org1.memberships.make(:user => user, :all_notifications => 'hourly')
          @membership2 = org2.memberships.make(:user => user, :all_notifications => 'hourly')

          mock(membership1).new_elections_in_period('hourly') { [org1_e1] }
          mock(membership1).new_candidates_in_period('hourly') { [org1_e1_c1, org1_e2_c1] }
          mock(membership1).new_comments_on_ranked_candidates_in_period('hourly') { [org1_e1_c1_comment, org1_e2_c1_comment ] }
          mock(membership1).new_comments_on_own_candidates_in_period('hourly') { [] }

          mock(membership2).new_elections_in_period('hourly') { [] }
          mock(membership2).new_candidates_in_period('hourly') { [] }
          mock(membership2).new_comments_on_ranked_candidates_in_period('hourly') { [] }
          mock(membership2).new_comments_on_own_candidates_in_period('hourly') { [org2_e1_c1_comment] }
        end

        it "for each of the user's memberships appropriate for the notification period, hierarchically organizes the elections, candidates, and comments" do
          presenter = NotificationPresenter.allocate
          mock(presenter).memberships_to_notify { [membership1, membership2] }
          presenter.send(:initialize, user, 'hourly')

          presenter.membership_presenters.size.should == 2

          membership1_presenter = presenter.membership_presenters[0]
          membership1_presenter.membership.should == membership1

          membership1_presenter.election_presenters.size.should == 2

          org1_e1_presenter = membership1_presenter.election_presenters.find {|ep| ep.election == org1_e1}
          org1_e1_presenter.candidate_presenters.size.should == 2

          org1_e1_c1_presenter = org1_e1_presenter.candidate_presenters.find {|cp| cp.candidate == org1_e1_c1}
          org1_e1_c1_presenter.new_comments.should == [org1_e1_c1_comment]

          org1_e1_c2_presenter = org1_e1_presenter.candidate_presenters.find {|cp| cp.candidate == org1_e1_c2}
          org1_e1_c2_presenter.new_comments.should be_empty

          membership2_presenter = presenter.membership_presenters[1]
          membership2_presenter.election_presenters.size.should == 1
          org2_e1_presenter = membership2_presenter.election_presenters.first
          org2_e1_presenter.candidate_presenters.size.should == 1
          org2_e1_c1_presenter = org2_e1_presenter.candidate_presenters.first
          org2_e1_c1_presenter.new_comments.should == [org2_e1_c1_comment]
        end
      end
    end
  end
end
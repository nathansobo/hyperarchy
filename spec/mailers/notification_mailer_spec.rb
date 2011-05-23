require "spec_helper"

describe NotificationMailer do
  attr_reader :org1, :org1_e1, :org1_e1_c1, :org1_e1_c1_comment, :org1_e1_c2, :org1_e2, :org1_e2_c1,
              :org1_e2_c1_comment, :org2, :org2_e1, :org2_e1_c1, :org2_e1_c1_comment,
              :user, :membership1, :membership2, :email

  before do
    set_current_user(User.make)

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

    stub(user).memberships_to_notify { [membership1, membership2] }

    mock(membership1).new_elections_in_period('hourly') { [org1_e1] }
    mock(membership1).new_candidates_in_period('hourly') { [org1_e1_c1, org1_e2_c1] }
    mock(membership1).new_comments_on_ranked_candidates_in_period('hourly') { [org1_e1_c1_comment, org1_e2_c1_comment ] }
    mock(membership1).new_comments_on_own_candidates_in_period('hourly') { [] }

    mock(membership2).new_elections_in_period('hourly') { [] }
    mock(membership2).new_candidates_in_period('hourly') { [] }
    mock(membership2).new_comments_on_ranked_candidates_in_period('hourly') { [] }
    mock(membership2).new_comments_on_own_candidates_in_period('hourly') { [org2_e1_c1_comment] }

    @email = NotificationMailer.notification(user, 'hourly').deliver
    ActionMailer::Base.deliveries.should == [email]
  end

  describe "#notification" do
    it "is from admin@hyperarchy.com, to the user's email address" do
      email.from.should == ["admin@hyperarchy.com"]
      email.to.should == [user.email_address]
    end

    it "gives counts for each new item in the subject" do
      email.subject.should == "1 new question, 2 new answers, and 3 new comments on Hyperarchy"
    end

    it "includes all elections, candidates, and comments that are new for the notification period" do
      expect_all_content_present(email.text_part.body)
      expect_all_content_present(email.html_part.body)
    end

    def expect_all_content_present(email_part_body)
      email_part_body.should include(org1.name)
      email_part_body.should include(org1_e1.body)
      email_part_body.should include(org1_e1_c1.body)
      email_part_body.should include(org1_e1_c1_comment.body)
      email_part_body.should include(org1_e2.body)
      email_part_body.should include(org1_e2_c1.body)
      email_part_body.should include(org1_e2_c1_comment.body)

      email_part_body.should include(org2.name)
      email_part_body.should include(org2_e1.body)
      email_part_body.should include(org2_e1_c1.body)
      email_part_body.should include(org2_e1_c1_comment.body)
    end
  end
end

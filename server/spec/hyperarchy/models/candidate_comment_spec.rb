require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Candidate do
    describe "before create" do
      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make)
        candidate = Candidate.make
        comment = candidate.comments.create!(:body => "Terrible terrible candidate", :suppress_notification_email => true)
        comment.creator.should == current_user
      end
    end

    describe "after create" do
      it "sends a notification email to users that have opted to receive it instantly and have either ranked or created the comment's candidate" do
        opted_in_creator = User.make(:email_address => "opted_in_creator@example.com")
        opted_out_creator = User.make(:email_address => "opted_out_creator@example.com")
        opted_in_ranker = User.make(:email_address => "opted_in_ranker@example.com")
        opted_out_ranker = User.make(:email_address => "opted_out_ranker@example.com")
        opted_in_non_ranker = User.make(:email_address => "opted_in_non_ranked@example.com")
        comment_creator = User.make(:email_address => "comment_creator@example.com")

        election = Election.make
        election.update!(:creator => opted_in_creator)
        organization = election.organization

        c1 = election.candidates.make
        c1.update!(:creator => opted_in_creator)

        c2 = election.candidates.make
        c2.update!(:creator => opted_out_creator)

        organization.memberships.make(:user => opted_in_creator, :notify_of_new_comments_on_own_candidates=> "immediately")
        organization.memberships.make(:user => opted_out_creator, :notify_of_new_comments_on_ranked_candidates => "never")
        organization.memberships.make(:user => opted_in_ranker, :notify_of_new_comments_on_ranked_candidates => "immediately")
        organization.memberships.make(:user => opted_in_non_ranker, :notify_of_new_candidates => "immediately")
        organization.memberships.make(:user => opted_out_ranker, :notify_of_new_candidates => "never")

        Ranking.create!(:candidate => c1, :user => opted_in_ranker, :position => 64)
        Ranking.create!(:candidate => c1, :user => opted_out_ranker, :position => 64)

        set_current_user(comment_creator)
        c1_comment = c1.comments.create!(:body => 'comment on c1')
        c2.comments.create!(:body => 'comment on c2')

        Mailer.emails.length.should == 2

        creator_email = Mailer.emails.find {|email| email[:to] == opted_in_creator.email_address }
        ranker_email = Mailer.emails.find {|email| email[:to] == opted_in_ranker.email_address }

        creator_email[:subject].should == "1 new comment on Hyperarchy"
        creator_email[:body].should include(c1_comment.body)
        creator_email[:html_body].should include(c1_comment.body)

        ranker_email[:subject].should == "1 new comment on Hyperarchy"
        ranker_email[:body].should include(c1_comment.body)
        ranker_email[:html_body].should include(c1_comment.body)
      end
    end
  end
end
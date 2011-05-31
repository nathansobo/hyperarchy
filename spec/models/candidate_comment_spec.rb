  require 'spec_helper'

module Models
  describe CandidateComment do
    attr_reader :candidate, :organization, :candidate_creator, :comment_creator, :comment
    before do
      @organization = Organization.make
      election = organization.elections.make
      @candidate_creator = organization.make_member
      @comment_creator = organization.make_member
      @candidate = election.candidates.make(:creator => candidate_creator)
      @comment = candidate.comments.make(:creator => comment_creator)
    end
    
    describe "before create" do
      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make)
        organization.memberships.make(:user => current_user)
        comment = candidate.comments.create!(:body => "Terrible terrible candidate", :suppress_notification_email => true)
        comment.creator.should == current_user
      end

      it "if the creator is not a member of the organization, makes them one (as long as the org is public)" do
        set_current_user(User.make)
        current_user.memberships.where(:organization => organization).should be_empty

        organization.update(:privacy => "private")
        expect do
          candidate.comments.create!(:body => "foo")
        end.should raise_error(SecurityError)

        organization.update(:privacy => "public")
        candidate.comments.create!(:body => "foo")

        current_user.memberships.where(:organization => organization).size.should == 1
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
        organization.memberships.make(:user => comment_creator)

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

    describe "#users_to_notify_immediately" do
      it "returns the members of the candidate's organization who either" +
          "- have voted on the candidate and have :notify_of_new_comments_on_ranked_candidates set to 'immediately'" +
          "- created the candidate and have :notify_of_new_comments_on_own_candidates set to 'immediately'" do
        notify1 = User.make
        notify2 = User.make
        dont_notify = User.make

        notify1.rankings.create!(:candidate => candidate, :position => 64)
        notify2.rankings.create!(:candidate => candidate, :position => 64)
        dont_notify.rankings.create!(:candidate => candidate, :position => 64)
        comment_creator.rankings.create!(:candidate => candidate, :position => 64)

        organization.memberships.make(:user => notify1, :notify_of_new_comments_on_ranked_candidates => 'immediately')
        organization.memberships.make(:user => notify2, :notify_of_new_comments_on_ranked_candidates => 'immediately')
        organization.memberships.make(:user => dont_notify, :notify_of_new_comments_on_ranked_candidates => 'hourly')
        organization.memberships.find(:user => candidate_creator).update!(:notify_of_new_comments_on_own_candidates => 'immediately')
        organization.memberships.find(:user => comment_creator).update!(:notify_of_new_comments_on_ranked_candidates => 'immediately')
        comment.users_to_notify_immediately.all.should =~ [notify1, notify2, candidate_creator]

        organization.memberships.find(:user => candidate_creator).update!(:notify_of_new_comments_on_own_candidates => 'hourly')
        comment.users_to_notify_immediately.all.should =~ [notify1, notify2]
      end
    end

    describe "security" do
      describe "#can_create?" do
        attr_reader :comment
        before do
          @comment = candidate.comments.make_unsaved
        end

        context "if the organization is public" do
          before do
            organization.update(:privacy => "public")
          end

          it "returns true if the current user is not a guest" do
            set_current_user(User.guest)
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
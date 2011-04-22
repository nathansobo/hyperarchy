require File.expand_path(File.dirname(__FILE__) + "/../hyperarchy_spec_helper")

module Hyperarchy
  describe Notifier do
    describe "#send_periodic_notifications(period)" do
      attr_reader :notifier, :social_org, :pro_org, :creator, :pro_user, :social_user

      before do
        # move time backward. nothing should be reported until time advances into the reporting period (1 hour before report)
        Timecop.freeze(2.hours.ago)

        @notifier = Notifier.new
        @social_org = Organization.find(:social => true)
        @pro_org = Organization.make

        @creator = User.make
        set_current_user(creator)
        @pro_user = User.make
        @social_user = User.make

        social_org.memberships.make(:user => social_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "immediately", :notify_of_new_comments_on_ranked_candidates => "weekly", :notify_of_new_comments_on_own_candidates => "hourly")
        social_org.memberships.make(:user => pro_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "hourly", :notify_of_new_comments_on_ranked_candidates => "hourly", :notify_of_new_comments_on_own_candidates => "hourly")
        pro_org.memberships.make(:user => pro_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "weekly", :notify_of_new_comments_on_ranked_candidates => "hourly", :notify_of_new_comments_on_own_candidates => "hourly")

        Timecop.freeze(1.minute.from_now) # move time past the "visited_at" date associated with these memberships
      end

      it "sends all notifications to all users for all their memberships" do
        social_election_1 = social_org.elections.make
        social_candidate_1 = social_election_1.candidates.make
        social_candidate_owned_by_social_user = social_election_1.candidates.make
        social_candidate_owned_by_social_user.update(:creator => social_user)
        social_user.rankings.create!(:candidate => social_candidate_1, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_1, :position => 64)
        social_candidate_1.comments.make

        pro_election_1 = pro_org.elections.make
        pro_candidate_1 = pro_election_1.candidates.make
        pro_user.rankings.create!(:candidate => pro_candidate_1, :position => 64)
        pro_candidate_1.comments.make

        ############################
        # move time forward, so that subsequent creations fall within reporting period
        Timecop.freeze(1.5.hours.from_now)
        ############################

        # this new election should be reported on for social users
        social_election_2 = social_org.elections.make
        social_candidate_2 = social_election_2.candidates.make
        social_user.rankings.create!(:candidate => social_candidate_2, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_2, :position => 64)

        # these comments are on candidates before the reporting period, but should still be reported
        # social user only wants to be notified of comments on their own candidates, so they should see only 1 of these
        social_candidate_1_comment = social_candidate_1.comments.make
        owned_social_candidate_comment = social_candidate_owned_by_social_user.comments.make
        
        # these candidates and their comments should be reported on because they are in the reporting period
        # even though they belong to an election that was created before it
        social_candidate_3 = social_election_1.candidates.make
        social_candidate_4 = social_election_1.candidates.make
        social_candidate_3_comment = social_candidate_3.comments.make
        social_candidate_4_comment = social_candidate_4.comments.make

        # this is a new election on the pro org, which should only be sent to pro user
        pro_election_2 = pro_org.elections.make
        pro_candidate_2 = pro_election_2.candidates.make

        # a comment on a pro candidate should be sent to to pro user
        pro_candidate_1_comment = pro_candidate_1.comments.make

        #############################
        # time moves forward again by 30 minutes and the report is sent.
        Timecop.freeze(30.minutes.from_now)
        #############################

        notifier = Notifier.new
        notifier.send_periodic_notifications(:hourly)

        Mailer.emails.length.should == 2
        social_user_notification = Mailer.emails.detect {|email| email[:to] == social_user.email_address}
        pro_user_notification = Mailer.emails.detect {|email| email[:to] == pro_user.email_address}

        # the social user should only receive hourly updates about new elections in the social org
        # and they should only hear about comments on their own answers
        social_user_notification[:subject].should =~ /question/
        social_user_notification[:subject].should =~ /comment/
        social_user_notification[:subject].should_not =~ /answer/

        presenter = social_user_notification[:notification_presenter]
        presenter.membership_presenters.length.should == 1
        presenter.new_election_count.should == 1
        presenter.new_candidate_count.should == 0
        presenter.new_comment_count.should == 1

        social_user_html = social_user_notification[:html_body]
        social_user_html.should include(social_election_2.body)
        social_user_html.should include(owned_social_candidate_comment.body)


        # the pro user should receive hourly updates about the new pro elections...
        # as well as hourly updates about social elections AND social candidates

        # the pro org should always be listed first
        pro_user_notification[:subject].should =~ /question/
        pro_user_notification[:subject].should =~ /answer/
        pro_user_notification[:subject].should =~ /comment/

        presenter = pro_user_notification[:notification_presenter]

        presenter.membership_presenters.length.should == 2
        presenter.new_election_count.should == 2
        presenter.new_candidate_count.should == 3
        presenter.new_comment_count.should == 5

        pro_user_html = pro_user_notification[:html_body]
        pro_user_html.should include(social_election_1.body)
        pro_user_html.should include(social_election_2.body)
        pro_user_html.should include(social_candidate_1.body)
        pro_user_html.should include(social_candidate_2.body)
        pro_user_html.should include(social_candidate_3.body)
        pro_user_html.should include(social_candidate_4.body)
        pro_user_html.should include(social_candidate_1_comment.body)
        pro_user_html.should include(social_candidate_3_comment.body)
        pro_user_html.should include(social_candidate_4_comment.body)
        pro_user_html.should include(owned_social_candidate_comment.body)
        
        pro_user_html.should include(pro_election_1.body)
        pro_user_html.should include(pro_election_2.body)
        pro_user_html.should include(pro_candidate_1.body)
        pro_user_html.should include(pro_candidate_2.body)
        pro_user_html.should include(pro_candidate_1_comment.body)
      end

      it "does not stop if there is an exception while sending email" do
        social_org.elections.make

        mock(Mailer).send(anything).ordered do
          raise "Exception sending email"
        end
        mock(LOGGER).error(anything)
        mock.proxy(Mailer).send(anything).ordered


        notifier.send_periodic_notifications(:hourly)

        Timecop.freeze(1.5.hours.from_now)

        Mailer.emails.length.should == 1
      end
    end
  end
end
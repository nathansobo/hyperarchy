require File.expand_path(File.dirname(__FILE__) + "/../hyperarchy_spec_helper")

module Hyperarchy
  describe Notifier do
    describe "#send_periodic_notifications(period)" do
      it "sends all notifications to all users for all their memberships" do
        social_org = Organization.find(:social => true)
        pro_org = Organization.make

        creator = User.make
        set_current_user(creator)
        pro_user = User.make
        social_user = User.make

        ###########################
        # move time backward. nothing should be reported until time advances into the reporting period (1 hour before report)
        Timecop.freeze(2.hours.ago)
        ###########################

        social_org.memberships.make(:user => social_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "immediately", :notify_of_new_comments_on_ranked_candidates => "weekly", :notify_of_new_comments_on_own_candidates => "hourly")
        social_org.memberships.make(:user => pro_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "hourly", :notify_of_new_comments_on_ranked_candidates => "hourly", :notify_of_new_comments_on_own_candidates => "hourly")
        pro_org.memberships.make(:user => pro_user, :notify_of_new_elections => "hourly", :notify_of_new_candidates => "weekly", :notify_of_new_comments_on_ranked_candidates => "hourly", :notify_of_new_comments_on_own_candidates => "hourly")

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

        Notifier = Notifier.new
        Notifier.send_periodic_notifications(:hourly)

        Mailer.emails.length.should == 2
        social_user_notification = Mailer.emails.detect {|email| email[:to] == social_user.email_address}
        pro_user_notification = Mailer.emails.detect {|email| email[:to] == pro_user.email_address}

        # the social user should only receive hourly updates about new elections in the social org
        # and they should only hear about comments on their own answers
        social_user_notification[:subject].should =~ /question/
        social_user_notification[:subject].should_not =~ /answer/
        notification_presenter = social_user_notification[:notification_presenter]
        notification_presenter.sections.length.should == 1
        section = notification_presenter.sections[0]
        section.membership.organization.should == social_org
        section.elections_section.should_not be_nil
        section.candidates_section.should be_nil
        section.elections_section.elections.should == [social_election_2]

        # the pro user should receive hourly updates about the new pro elections...
        # as well as hourly updates about social elections AND social candidates

        # the pro org should always be listed first
        pro_user_notification[:subject].should =~ /question/
        pro_user_notification[:subject].should =~ /answer/
        notification_presenter = pro_user_notification[:notification_presenter]
        notification_presenter.sections.length.should == 2
        pro_section = notification_presenter.sections[0]
        pro_section.membership.organization.should == pro_org
        pro_section.elections_section.should_not be_nil
        pro_section.candidates_section.should be_nil
        pro_section.elections_section.elections.should == [pro_election_2]

        # next comes the social org report, with 1 election and 2 groups of 3 candidates
        social_section = notification_presenter.sections[1]
        social_section.membership.organization.should == social_org
        social_section.elections_section.should_not be_nil
        social_section.candidates_section.should_not be_nil
        social_section.elections_section.elections.should == [social_election_2]

        candidates_section = social_section.candidates_section
        candidates_section.candidate_groups.length.should == 2

        # one candidate was created in the reporting period for election 2
        social_election_2_candidate_group = candidates_section.candidate_groups.detect {|g| g.election == social_election_2}
        social_election_2_candidate_group.candidates.should == [social_candidate_2]

        # two candidates were created in the reporting period for election 1
        social_election_1_candidate_group = candidates_section.candidate_groups.detect {|g| g.election == social_election_1}
        Set.new(social_election_1_candidate_group.candidates).should == Set.new([social_candidate_3, social_candidate_4])
      end
    end
  end
end
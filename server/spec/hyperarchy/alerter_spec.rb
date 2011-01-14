require File.expand_path(File.dirname(__FILE__) + "/../hyperarchy_spec_helper")

module Hyperarchy
  describe Alerter do
    describe "#send_alerts(period)" do
      it "sends all alerts to all users for all their memberships" do
        social_org = Organization.find(:social => true)
        pro_org = Organization.make

        creator = User.make
        set_current_user(creator)
        pro_user = User.make
        social_user = User.make

        # move time backward. nothing should be reported until time advances into the reporting period (1 hour before report)
        Timecop.freeze(2.hours.ago)
        social_org.memberships.make(:user => social_user, :election_alerts => "hourly", :candidate_alerts => "immediately")
        social_org.memberships.make(:user => pro_user, :election_alerts => "hourly", :candidate_alerts => "hourly")
        pro_org.memberships.make(:user => pro_user, :election_alerts => "hourly", :candidate_alerts => "weekly")

        social_election_1 = social_org.elections.make
        social_candidate_1 = social_election_1.candidates.make
        social_user.rankings.create!(:candidate => social_candidate_1, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_1, :position => 64)

        pro_election_1 = pro_org.elections.make
        pro_candidate_1 = pro_election_1.candidates.make
        pro_user.rankings.create!(:candidate => pro_candidate_1, :position => 64)

        # move time forward, so that subsequent creations fall within reporting period
        Timecop.freeze(1.5.hours.from_now)

        social_election_2 = social_org.elections.make
        social_candidate_2 = social_election_2.candidates.make
        social_user.rankings.create!(:candidate => social_candidate_2, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_2, :position => 64)

        # this candidate should be reported on even though they belong to an older election
        social_candidate_3 = social_election_1.candidates.make
        social_candidate_4 = social_election_1.candidates.make

        pro_election_2 = pro_org.elections.make
        pro_candidate_2 = pro_election_2.candidates.make
        pro_user.rankings.create!(:candidate => pro_candidate_2, :position => 64)


        # time moves forward again by 30 minutes and the report is sent.
        Timecop.freeze(30.minutes.from_now)
        alerter = Alerter.new
        alerter.send_alerts(:hourly)

        Mailer.emails.length.should == 2
        social_user_alert = Mailer.emails.detect {|email| email[:to] == social_user.email_address}
        pro_user_alert = Mailer.emails.detect {|email| email[:to] == pro_user.email_address}

        # the social user should only receive hourly updates about new elections in the social org
        social_user_alert[:subject].should =~ /question/
        social_user_alert[:subject].should_not =~ /answer/
        alert_presenter = social_user_alert[:alert_presenter]
        alert_presenter.sections.length.should == 1
        section = alert_presenter.sections[0]
        section.membership.organization.should == social_org
        section.elections_section.should_not be_nil
        section.candidates_section.should be_nil
        section.elections_section.elections.should == [social_election_2]

        # the pro user should receive hourly updates about the new pro elections...
        # as well as hourly updates about social elections AND social candidates

        # the pro org should always be listed first
        pro_user_alert[:subject].should =~ /question/
        pro_user_alert[:subject].should =~ /answer/
        alert_presenter = pro_user_alert[:alert_presenter]
        alert_presenter.sections.length.should == 2
        pro_section = alert_presenter.sections[0]
        pro_section.membership.organization.should == pro_org
        pro_section.elections_section.should_not be_nil
        pro_section.candidates_section.should be_nil
        pro_section.elections_section.elections.should == [pro_election_2]

        # next comes the social org report, with 1 election and 2 groups of 3 candidates
        social_section = alert_presenter.sections[1]
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
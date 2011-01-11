require File.expand_path(File.dirname(__FILE__) + "/../hyperarchy_spec_helper")

module Hyperarchy
  describe Alerter do
    describe "#send_alerts(period)" do


      # 2 members. 1 is just in hyperarchy social, other is in both

      # 1 wants to receive hourly notifications about questions and answers
      # the other wants hourly for their private group, hourly for answers, weekly for questions

      it "sends all alerts to all users for all their memberships" do
        social_org = Organization.find(:social => true)
        pro_org = Organization.make

        pro_user = User.make
        social_user = User.make

        Timecop.freeze(2.hours.ago)
        social_org.memberships.make(:user => social_user, :election_alerts => "hourly", :candidate_alerts => "immediately")
        social_org.memberships.make(:user => pro_user, :election_alerts => "hourly", :candidate_alerts => "hourly")
        pro_org.memberships.make(:user => pro_user, :election_alerts => "hourly", :candidate_alerts => "weekly")

        # should not show up in alerts because they are before the period
        social_election_1 = social_org.elections.make
        social_candidate_1 = social_election_1.candidates.make
        social_user.rankings.create!(:candidate => social_candidate_1, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_1, :position => 64)

        pro_election_1 = pro_org.elections.make
        pro_candidate_1 = pro_election_1.candidates.make
        pro_user.rankings.create!(:candidate => pro_candidate_1, :position => 64)

        Timecop.freeze(1.5.hours.from_now) # move time forward, so that creations fall within period

        social_election_2 = social_org.elections.make
        social_candidate_2 = social_election_2.candidates.make
        social_user.rankings.create!(:candidate => social_candidate_2, :position => 64)
        pro_user.rankings.create!(:candidate => social_candidate_2, :position => 64)

        pro_election_2 = pro_org.elections.make
        pro_candidate_2 = pro_election_2.candidates.make
        pro_user.rankings.create!(:candidate => pro_candidate_2, :position => 64)
        
        alerter = Alerter.new
        alerter.send_alerts(:hourly)

        Mailer.emails.length.should == 2
      end
    end
  end
end
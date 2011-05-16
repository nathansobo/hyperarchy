require 'spec_helper'

module Models
  describe Membership do
    attr_reader :organization, :user
    before do
      @organization = Organization.make
      @user = set_current_user(User.make)
    end

    describe "before create" do
      it "assigns last_visited to the current time" do
        freeze_time
        freeze_time
        membership = organization.memberships.make(:user => User.make)
        membership.last_visited.should == Time.now
      end
    end

    describe "when not pending" do
      it "does not send a confirmation email" do
        organization.memberships.create!(:user => User.make, :pending => false)
        Mailer.emails.should be_empty
      end
    end

    describe "when created with an email address of an existing user" do
      it "associates the pending membership with the user that has that email address and sends them an email with a confirmation link" do
        user = User.make
        membership = organization.memberships.create!(:email_address => user.email_address)
        membership.user.should == user
        membership.should be_pending
        membership.invitation.should be_nil

        ActionMailer::Base.deliveries.length.should == 1
        email = ActionMailer::Base.deliveries.shift
        email.to.should == [user.email_address]
        email.subject.should match(/#{current_user.full_name}/)
        email.subject.should match(/#{organization.name}/)
        email.text_part.body.should match(membership.to_param)
      end
    end

    describe "when created with an unknown email address" do
      it "associates the pending membership with an invitation with the given email address and sends them an email with a link to the invitation" do
        first_name = "New"
        last_name = "Member"
        email_address = "new_member@example.com"

        membership_1 = organization.memberships.create!(:first_name => first_name, :last_name => last_name, :email_address => email_address)
        membership_1.should be_pending

        invitation = membership_1.invitation
        invitation.inviter.should == current_user
        invitation.first_name.should == first_name
        invitation.last_name.should == last_name
        invitation.sent_to_address.should == email_address
        membership_1.user.should be_nil

        ActionMailer::Base.deliveries.length.should == 1
        invite_email = ActionMailer::Base.deliveries.shift
        invite_email.text_part.body.should include(invitation.guid)

        # Membership to a different organization associtates with the same invitation
        organization_2 = Organization.make
        membership_2 = organization_2.memberships.create!(:email_address => email_address)

        membership_2.should be_pending
        membership_2.invitation.should == invitation

        ActionMailer::Base.deliveries.length.should == 1
        invite_email_2 = ActionMailer::Base.deliveries.shift
        invite_email_2.text_part.body.should include(invitation.guid)
      end
    end

    describe "security" do
      describe "#can_create?, #can_update?, #can_destroy?" do
        it "only allows admins, organization owners to modify memberships. the members themselves can update only the last_visited and email preferences columns" do
          organization = Organization.make
          member = organization.make_member
          owner = organization.make_owner
          admin = User.make(:admin => true)
          other_user = User.make

          new_membership = organization.memberships.new(:user => other_user)
          membership = organization.memberships.find(:user => member)

          set_current_user(member)
          new_membership.can_create?.should be_false
          membership.can_update?.should be_true
          membership.can_destroy?.should be_false
          membership.can_update_columns?([:role, :notify_of_new_elections, :notify_of_new_candidates]).should be_false
          membership.can_update_columns?([:last_visited]).should be_true

          set_current_user(owner)
          new_membership.can_create?.should be_true
          membership.can_update?.should be_true
          membership.can_destroy?.should be_true

          set_current_user(admin)
          new_membership.can_create?.should be_true
          membership.can_update?.should be_true
          membership.can_destroy?.should be_true
        end
      end
    end

    describe "methods supporting notifications" do
      let(:membership) { organization.memberships.make(:user => user) }
      let(:other_user) { organization.make_member }
      let(:time_of_notification) { freeze_time }

      describe "#new_elections_in_period(period)" do
        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns elections not created by the membership's user that were created after the beginning of the last period" do
            time_travel_to(time_of_notification - 70.minutes)
            organization.elections.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            organization.elections.make(:creator => user)
            e1 = organization.elections.make(:creator => other_user)
            e2 = organization.elections.make(:creator => other_user)
            Election.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_elections_in_period('hourly').all.should =~ [e1, e2]
          end
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns elections not created by the membership's user that were created after the time of the last visit" do
            time_travel_to(time_of_notification - 70.minutes)
            organization.elections.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            organization.elections.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            organization.elections.make(:creator => user)
            e1 = organization.elections.make(:creator => other_user)
            e2 = organization.elections.make(:creator => other_user)
            Election.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_elections_in_period('hourly').all.should =~ [e1, e2]
          end
        end
      end


      describe "#new_candidates_in_period(period)" do
        attr_reader :election_with_vote, :election_without_vote

        before do
          time_travel_to(time_of_notification - 2.hours)
          @election_without_vote = organization.elections.make(:creator => other_user)
          @election_with_vote = organization.elections.make(:creator => other_user)
          candidate_to_rank =  election_with_vote.candidates.make
          election_with_vote.rankings.create(:user => user, :candidate => candidate_to_rank, :position => 64)
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 2.hours)
          end

          it "returns candidates not created by the membership's user that were created after the beginning of the last period" do
            time_travel_to(time_of_notification - 70.minutes)
            election_with_vote.candidates.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            election_without_vote.candidates.make(:creator => other_user)
            c1 = election_with_vote.candidates.make(:creator => other_user)
            c2 = election_with_vote.candidates.make(:creator => other_user)
            election_with_vote.candidates.make(:creator => user)
            Candidate.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_candidates_in_period('hourly').all.should =~ [c1, c2]
          end
        end

        context "when the user last visited before the beginning of the last period" do
          before do
            membership.update(:last_visited => time_of_notification - 40.minutes)
          end

          it "returns elections not created by the membership's user that were created after the time of the last visit" do
            time_travel_to(time_of_notification - 70.minutes)
            organization.elections.make(:creator => other_user)

            time_travel_to(time_of_notification - 50.minutes)
            organization.elections.make(:creator => other_user)

            time_travel_to(time_of_notification - 30.minutes)
            organization.elections.make(:creator => user)
            e1 = organization.elections.make(:creator => other_user)
            e2 = organization.elections.make(:creator => other_user)
            Election.make(:creator => other_user) # other org, should not show up

            time_travel_to(time_of_notification)
            membership.new_elections_in_period('hourly').all.should =~ [e1, e2]
          end
        end
      end
    end
  end
end

require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Membership do
    attr_reader :organization
    before do
      @organization = Organization.make
      set_current_user(User.make)
    end

    describe "before create" do
      it "assigns last_visited to the current time" do
        Timecop.freeze(Time.now)
        membership = organization.memberships.create!(:user => User.make)
        membership.last_visited.should == Time.now
      end

      it "assigns email preferences for social memberships to never" do
        organization.update(:social => true)
        membership = organization.memberships.make(:user => User.make)
        membership.notify_of_new_elections.should == 'never'
        membership.notify_of_new_candidates.should == 'never'
        membership.notify_of_new_comments_on_own_candidates.should == 'never'
        membership.notify_of_new_comments_on_ranked_candidates.should == 'never'
      end

      it "assigns email preferences for non-social memberships to immediate" do
        membership = organization.memberships.make(:user => User.make)
        membership.notify_of_new_elections.should == 'immediately'
        membership.notify_of_new_candidates.should == 'immediately'
        membership.notify_of_new_comments_on_own_candidates.should == 'immediately'
        membership.notify_of_new_comments_on_ranked_candidates.should == 'immediately'
      end
    end

    describe "after create" do
      it "increments the member_count field of the organization" do
        expect { organization.memberships.create!(:user => User.make) }.to change(organization, :member_count).by(1)
      end
    end

    describe "after destroy" do
      it "decrements the member_count field of the organization" do
        membership = organization.memberships.make
        expect { membership.destroy }.to change(organization, :member_count).by(-1)
      end
    end

    describe "before update" do
      context "if the has_participated field is changing from false to true and the organization is social" do
        attr_reader :membership
        before do
          organization.update(:social => true)
          @membership = organization.memberships.make(:has_participated => false)
        end

        it "sets the email preferences to 'daily'" do
          membership.notify_of_new_elections.should == 'never'
          membership.notify_of_new_candidates.should == 'never'
          membership.notify_of_new_comments_on_own_candidates.should == 'never'
          membership.notify_of_new_comments_on_ranked_candidates.should == 'never'

          membership.update(:has_participated => true)

          membership.notify_of_new_elections.should == 'daily'
          membership.notify_of_new_candidates.should == 'daily'
          membership.notify_of_new_comments_on_own_candidates.should == 'daily'
          membership.notify_of_new_comments_on_ranked_candidates.should == 'daily'
        end
      end

      context "if an email preference field is being changed" do
        it "sets the has_participated field to true" do
          m1 = organization.memberships.make(:has_participated => false)
          m2 = organization.memberships.make(:has_participated => false)
          m3 = organization.memberships.make(:has_participated => false)
          m4 = organization.memberships.make(:has_participated => false)
          m5 = organization.memberships.make(:has_participated => false)

          m1.update(:notify_of_new_elections => 'daily')
          m1.should have_participated

          m2.update(:notify_of_new_candidates => 'daily')
          m2.should have_participated

          m3.update(:notify_of_new_comments_on_ranked_candidates => 'daily')
          m3.should have_participated

          m4.update(:notify_of_new_comments_on_own_candidates => 'daily')
          m4.should have_participated

          m5.update(:role => 'owner')
          m5.should_not have_participated
        end
      end
    end

    describe "when not pending" do
      it "does not send a confirmation email" do
        organization.memberships.create!(:user => User.make, :pending => false)
        Mailer.emails.should be_empty
      end
    end

    describe "when created with an email address of an existing user" do
      it "associates the pending membership with the user that has that email address and sends them an email with a link to join the organization" do
        user = User.make
        membership = organization.memberships.create!(:email_address => user.email_address)
        membership.user.should == user
        membership.should be_pending
        membership.invitation.should be_nil

        Mailer.emails.length.should == 1
        invite_email = Mailer.emails.first

        invite_email[:to].should == user.email_address
        invite_email[:subject].should match(/#{current_user.full_name}/)
        invite_email[:subject].should match(/#{organization.name}/)
        invite_email[:body].should match(/confirm_membership\/#{membership.id}/)
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

        Mailer.emails.length.should == 1
        invite_email_1 = Mailer.emails.shift
        invite_email_1[:to].should == email_address
        invite_email_1[:subject].should include(current_user.full_name)
        invite_email_1[:subject].should include(organization.name)
        invite_email_1[:body].should match(/signup\?invitation_code=#{invitation.guid}/)

        # Membership to a different organization associtates with the same invitation
        organization_2 = Organization.make
        membership_2 = organization_2.memberships.create!(:email_address => email_address)

        membership_2.should be_pending
        membership_2.invitation.should == invitation

        Mailer.emails.length.should == 1
        invite_email_2 = Mailer.emails.shift
        invite_email_2[:to].should == email_address
        invite_email_2[:subject].should include(current_user.full_name)
        invite_email_2[:subject].should include(organization_2.name)
        invite_email_2[:body].should match(/signup\?invitation_code=#{invitation.guid}/)
      end
    end

    describe "security" do
      describe "#can_create?, #can_update?, #can_destroy?" do
        it "only allows admins, organization owners to modify memberships. the members themselves can update only the last_visited and email preferences columns" do
          organization = Organization.make
          member = make_member(organization)
          owner = make_owner(organization)
          admin = User.make(:admin => true)
          other_user = User.make

          new_membership = organization.memberships.build(:user => other_user)
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
  end
end

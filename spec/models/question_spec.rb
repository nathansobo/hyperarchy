require 'spec_helper'

module Models
  describe Election do
    attr_reader :election, :organization, :creator, :memphis, :knoxville, :chattanooga, :nashville, :unranked

    before do
      freeze_time

      @organization = Organization.make
      @creator = organization.make_member
      @election = organization.elections.make(:body => "Where should the capital of Tennesee be?", :creator => creator)
      @memphis = election.candidates.make(:body => "Memphis")
      @knoxville = election.candidates.make(:body => "Knoxville")
      @chattanooga = election.candidates.make(:body => "Chattanooga")
      @nashville = election.candidates.make(:body => "Nashville")
      @unranked = election.candidates.make(:body => "Unranked")
    end


    describe ".update_scores" do
      it "causes scores to go down as time passes" do
        initial_score = election.score

        election.update(:created_at => 1.hour.ago)
        Election.update_scores
        
        election.reload.score.should be < initial_score
      end

      it "causes scores to go up as votes are added" do
        initial_score = election.score

        election.update(:vote_count => 10)
        Election.update_scores
        
        election.reload.score.should be > initial_score
      end
    end

    describe "before create" do
      it "if the creator is not a member of the election's organization, makes them one (as long as the org is public)" do
        set_current_user(User.make)
        current_user.memberships.where(:organization => organization).should be_empty

        organization.update(:privacy => "private")
        expect do
          organization.elections.create!(:body => "foo")
        end.should raise_error(SecurityError)

        organization.update(:privacy => "public")
        organization.elections.create!(:body => "foo")

        current_user.memberships.where(:organization => organization).size.should == 1
      end

      it "assigns the creator to the Model::Record.current_user" do
        set_current_user(User.make)
        election = Election.make
        election.creator.should == current_user
      end

      it "assigns a score" do
        election.score.should_not be_nil
      end
    end

    describe "after create" do
      attr_reader :organization, :creator, :opted_in, :opted_out, :non_member

      before do
        @organization = Organization.make
        @creator = User.make
        @opted_in = User.make
        @opted_out = User.make
        @non_member = User.make

        organization.memberships.make(:user => creator, :notify_of_new_elections => "immediately")
        organization.memberships.make(:user => opted_in, :notify_of_new_elections => "immediately")
        organization.memberships.make(:user => opted_out, :notify_of_new_elections => "never")

        set_current_user(creator)
      end

      it "enqueues a SendImmediateNotification job with the election" do
        job_params = nil
        mock(Jobs::SendImmediateNotifications).create(is_a(Hash)) do |params|
          job_params = params
        end
        
        election = organization.elections.create!(:body => "What should we eat for dinner?")
        job_params.should ==  { :class_name => "Election", :id => election.id }
      end

      it "increments the election count on its organization" do
        lambda do
          organization.elections.create!(:body => "What should we eat for dinner?")
        end.should change { organization.election_count }.by(1)
      end
    end

    describe "before update" do
      it "updates the score if the vote count changed" do
        score_before = election.score
        election.vote_count += 1
        election.save
        election.score.should be > score_before
      end
    end

    describe "before destroy" do
      it "destroys any candidates, candidate comments, votes and visits that belong to the election" do
        election = Election.make
        user_1 = election.organization.make_member
        user_2 = election.organization.make_member
        candidate_1 = election.candidates.make
        candidate_2 = election.candidates.make
        candidate_1.comments.make
        candidate_2.comments.make

        Ranking.create!(:user => user_1, :candidate => candidate_1, :position => 64)
        Ranking.create!(:user => user_1, :candidate => candidate_2, :position => 32)
        Ranking.create!(:user => user_2, :candidate => candidate_1, :position => 64)
        election.election_visits.create!(:user => user_1)

        election.election_visits.size.should == 1
        election.candidates.size.should == 2
        election.votes.size.should == 2
        election.candidates.join_through(CandidateComment).size.should == 2
        election.destroy
        election.candidates.should be_empty
        election.votes.should be_empty
        election.election_visits.should be_empty
        election.candidates.join_through(CandidateComment).should be_empty
      end
    end

    describe "after destroy" do
      it "decrements the election count on its organization" do
        election = Election.make
        lambda do
          election.destroy
        end.should change { election.organization.election_count }.by(-1)
      end
    end

    describe "#compute_global_ranking" do
      it "uses the ranked-pairs algoritm to produce a global ranking, assigning a position of null to any unranked candidates" do
        jump(1.minute)

        4.times do
          user = User.make
          election.rankings.create(:user => user, :candidate => memphis, :position => 4)
          election.rankings.create(:user => user, :candidate => nashville, :position => 3)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 2)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 1)
        end

        3.times do
          user = User.make
          election.rankings.create(:user => user, :candidate => nashville, :position => 4)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 3)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 2)
          election.rankings.create(:user => user, :candidate => memphis, :position => 1)
        end

        1.times do
          user = User.make
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 4)
          election.rankings.create(:user => user, :candidate => knoxville, :position => 3)
          election.rankings.create(:user => user, :candidate => nashville, :position => 2)
          election.rankings.create(:user => user, :candidate => memphis, :position => 1)
        end

        2.times do
          user = User.make
          election.rankings.create(:user => user, :candidate => knoxville, :position => 4)
          election.rankings.create(:user => user, :candidate => chattanooga, :position => 3)
          election.rankings.create(:user => user, :candidate => nashville, :position => 2)
          election.rankings.create(:user => user, :candidate => memphis, :position => 1)
        end

        election.compute_global_ranking

        nashville.reload.position.should == 1
        chattanooga.position.should == 2
        knoxville.position.should == 3
        memphis.position.should == 4
        unranked.position.should == 5

        election.updated_at.to_i.should == Time.now.to_i
      end
    end

    describe "#users_to_notify_immediately" do
      it "includes members of the organization that have their election notification preference set to immediately and are not the creator of the election" do
        notify1 = User.make
        notify2 = User.make
        dont_notify = User.make

        organization.memberships.make(:user => notify1, :notify_of_new_elections => 'immediately')
        organization.memberships.make(:user => notify2, :notify_of_new_elections => 'immediately')
        organization.memberships.make(:user => dont_notify, :notify_of_new_elections => 'hourly')
        organization.memberships.find(:user => creator).update!(:notify_of_new_elections => 'immediately')

        election.users_to_notify_immediately.all.should =~ [notify1, notify2]
      end
    end

    describe "security" do
      attr_reader :organization, :member, :owner, :admin, :non_member

      before do
        @organization = Organization.make
        @member = organization.make_member
        @owner = organization.make_owner
        @admin = User.make(:admin => true)
        @non_member = User.make
      end

      describe "body length limit" do
        it "raises a security error if trying to create or update with a body longer than 140 chars" do
          long_body = "x" * 145

          expect {
            Election.make(:body => long_body)
          }.to raise_error(SecurityError)

          expect {
            Election.make.update(:body => long_body)
          }.to raise_error(SecurityError)

          election = Election.make

          # grandfathered elections can have other properties updated, but not the body
          Prequel::DB[:elections].filter(:id => election.id).update(:body => long_body)
          election.reload

          election.update(:details => "Hi") # should work
          expect {
            election.update(:body => long_body + "and even longer!!!")
          }.to raise_error(SecurityError)
        end
      end

      describe "#can_create?" do
        before do
          @election = organization.elections.make_unsaved
        end

        context "if the election's organization is non-public" do
          before do
            election.organization.update(:privacy => "read_only")
          end

          specify "only members create candidates" do
            set_current_user(member)
            election.can_create?.should be_true

            set_current_user(non_member)
            election.can_create?.should be_false
          end
        end

        context "if the given election's organization is public" do
          before do
            election.organization.update(:privacy => "public")
          end

          specify "non-guest users can create candidates" do
            set_current_user(User.default_guest)
            election.can_create?.should be_false

            set_current_user(non_member)
            election.can_create?.should be_true
          end
        end
      end

      describe "#can_update? and #can_destroy?" do
        it "only allows admins, organization owners, and the creator of the election itself to update or destroy it" do
          other_member = set_current_user(User.make)
          organization.memberships.create!(:user => other_member)
          election = organization.elections.create!(:body => "What should we do?")

          set_current_user(member)
          election.can_update?.should be_false
          election.can_destroy?.should be_false


          set_current_user(other_member)
          election.can_update?.should be_true
          election.can_destroy?.should be_true

          set_current_user(owner)
          election.can_update?.should be_true
          election.can_destroy?.should be_true

          set_current_user(admin)
          election.can_update?.should be_true
          election.can_destroy?.should be_true
        end
      end
    end
  end
end

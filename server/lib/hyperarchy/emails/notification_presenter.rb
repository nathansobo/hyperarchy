module Hyperarchy
  module Emails
    module HeadlineGeneration
      def item_counts
        items = []
        items.push("#{new_election_count} new #{'question'.numberize(new_election_count)}") if new_election_count > 0
        items.push("#{new_candidate_count} new #{'answer'.numberize(new_candidate_count)}") if new_candidate_count > 0
        items.push("#{new_comment_count} new #{'comment'.numberize(new_comment_count)}") if new_comment_count > 0

        case items.length
          when 3
            "#{items[0]}, #{items[1]}, and #{items[2]}"
          when 2
            "#{items[0]} and #{items[1]}"
          when 1
            items[0]
        end
      end
    end


    class NotificationPresenter
      include HeadlineGeneration

      attr_reader :user, :period, :item, :membership_presenters
      attr_accessor :new_election_count, :new_candidate_count, :new_comment_count

      def initialize(user, period, item=nil)
        @user, @period, @item = user, period, item
        if period == "immediately"
          build_immediate_notification
        else
          build_periodic_notification
        end
        gather_counts
      end

      def build_immediate_notification
        membership = item.organization.memberships.find(:user => user)
        @membership_presenters = [MembershipPresenter.new(membership, period, item)]
      end

      def build_periodic_notification
        @membership_presenters = memberships_to_notify.map do |membership|
          MembershipPresenter.new(membership, period, nil)
        end
      end

      def gather_counts
        @new_election_count = 0
        @new_candidate_count = 0
        @new_comment_count = 0

        membership_presenters.each do |presenter|
          self.new_election_count += presenter.new_election_count
          self.new_candidate_count += presenter.new_candidate_count
          self.new_comment_count += presenter.new_comment_count
        end
      end

      def memberships_to_notify
        user.memberships.
          join_to(Organization).
          order_by(:social).
          project(Membership).
          all.
          select {|m| m.wants_notifications?(period)}
      end

      def subject
        "#{item_counts} on Hyperarchy"
      end
    end

    class MembershipPresenter
      include HeadlineGeneration

      attr_reader :membership, :period, :item
      attr_reader :election_presenters_by_election, :candidate_presenters_by_candidate
      attr_accessor :new_election_count, :new_candidate_count, :new_comment_count
      delegate :organization, :to => :membership

      def initialize(membership, period, item)
        @membership, @period, @item = membership, period, item
        @election_presenters_by_election = {}
        @candidate_presenters_by_candidate = {}
        @new_election_count = 0
        @new_candidate_count = 0
        @new_comment_count = 0

        if period == "immediately"
          build_immediate_notification
        else
          build_periodic_notification
        end
      end

      def build_immediate_notification
        case item
          when Election
            add_new_election(item)
          when Candidate
            add_new_candidate(item)
          else
            "No notification mechanism implemented for item: #{item.inspect}"
        end
      end

      def build_periodic_notification
        if membership.wants_election_notifications?(period)
          membership.new_elections_in_period(period).each do |election|
            add_new_election(election)
          end
        end

        if membership.wants_candidate_notifications?(period)
          membership.new_candidates_in_period(period).each do |candidate|
            add_new_candidate(candidate)
          end
        end
      end

      def add_new_election(election)
        self.new_election_count += 1
        election_presenters_by_election[election] = ElectionPresenter.new(election, true)
      end

      def add_new_candidate(candidate)
        self.new_candidate_count += 1
        election = candidate.election
        unless election_presenters_by_election.has_key?(election)
          election_presenters_by_election[election] = ElectionPresenter.new(election, false)
        end
        election_presenters_by_election[election].add_new_candidate(candidate)
      end

      def election_presenters
        election_presenters_by_election.values.sort_by(&:score).reverse!
      end

      def headline
        "#{item_counts}:"
      end
    end

    class ElectionPresenter
      attr_reader :election, :election_is_new
      attr_reader :candidate_presenters_by_candidate
      delegate :score, :to => :election

      def initialize(election, election_is_new)
        @election, @election_is_new = election, election_is_new

        if election_is_new
          @candidate_presenters = election.candidates.map do |candidate|
            CandidatePresenter.new(candidate, true)
          end
        else
          @candidate_presenters_by_candidate = {}
        end
      end

      def add_new_candidate(candidate)
        return if election_is_new
        candidate_presenters_by_candidate[candidate] = CandidatePresenter.new(candidate, true)
      end

      def candidate_presenters
        if election_is_new
          @candidate_presenters
        else
          candidate_presenters_by_candidate.values.sort_by(&:position)
        end
      end
    end

    class CandidatePresenter
      attr_reader :candidate, :candidate_is_new
      delegate :position, :to => :candidate

      def initialize(candidate, candidate_is_new)
        @candidate, @candidate_is_new = candidate, candidate_is_new
      end
    end

    class CommentPresenter

    end
  end
end
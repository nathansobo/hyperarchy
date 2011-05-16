module Views
  module NotificationMailer
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
          when CandidateComment
            add_new_comment(item)
          else
            raise "No notification mechanism implemented for item: #{item.inspect}"
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

        if membership.wants_own_candidate_comment_notifications?(period)
          membership.new_comments_on_own_candidates_in_period(period).each do |comment|
            add_new_comment(comment)
          end
        end

        if membership.wants_ranked_candidate_comment_notifications?(period)
          membership.new_comments_on_ranked_candidates_in_period(period).each do |comment|
            add_new_comment(comment)
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
        build_election_presenter_if_needed(election)
        election_presenters_by_election[election].add_new_candidate(candidate)
      end

      def add_new_comment(comment)
        self.new_comment_count += 1
        election = comment.election
        build_election_presenter_if_needed(election)
        election_presenters_by_election[election].add_new_comment(comment)
      end

      def build_election_presenter_if_needed(election)
        return if election_presenters_by_election.has_key?(election)
        election_presenters_by_election[election] = ElectionPresenter.new(election, false)
      end

      def election_presenters
        election_presenters_by_election.values.sort_by(&:score).reverse!
      end

      def headline
        "#{item_counts}:"
      end

      def empty?
        new_election_count == 0 && new_candidate_count == 0 && new_comment_count == 0
      end

      def add_lines(lines)
        lines.push(headline, "")

        election_presenters.each do |presenter|
          presenter.add_lines(lines)
        end
      end
    end
  end
end

module Hyperarchy
  class Notifier
    class << self
      def instance
        @instance ||= new
      end

      delegate :send_periodic_notifications, :send_immediate_notifications, :to => :instance
    end


    def send_periodic_notifications(period)
      period = period.to_s

      User.each do |user|
        send_notification_to_user(user, NotificationPresenter.new(user, period))
      end
    end

    def send_immediate_notifications(item)
      item.users_to_notify_immediately.each do |user|
        send_notification_to_user(user, NotificationPresenter.new(user, "immediately", item))
      end
    end

    def send_notification_to_user(user, notification_presenter)
      return if notification_presenter.sections.empty?
      Mailer.send(
        :to => user.email_address,
        :subject => notification_presenter.subject,
        :notification_presenter => notification_presenter,
        :body => notification_presenter.to_s,
        :erector_class => Emails::Notification,
      )
    end

    class NotificationPresenter
      attr_reader :user, :period, :sections, :item

      def initialize(user, period, item=nil)
        @user = user
        @period = period
        @item = item

        if period == "immediately"
          build_immediate_notification_section
        else
          build_periodic_notification_sections
        end
      end

      # in this version, we know we only have 1 item to notification, so we get the membership from it
      def build_immediate_notification_section
        membership_for_item = item.organization.memberships.where(:user => user).first
        @sections = [MembershipSection.new(membership_for_item, period, item)]
      end

      def build_periodic_notification_sections
        @sections = memberships.map do |membership|
          if membership.wants_notifications?(period)
            section = MembershipSection.new(membership, period)
            section if section.candidates_section || section.elections_section
          end
        end.compact
      end

      def to_s
        lines = []

        sections.each do |section|
          if sections.length > 1
            lines.push(section.organization.name)
            lines.push("-" * section.organization.name.length)
            lines.push("")
          end

          section.add_lines(lines)
        end

        lines.join("\n")
      end


      def memberships
        user.memberships.
          join_to(Organization).
          order_by(:social).
          project(Membership)
      end

      def subject
        if period == "immediately"
          if new_elections?
            "New question on Hyperarchy"
          else
            "New answer on Hyperarchy"
          end
        else
          items = []
          items.push("questions") if new_elections?
          items.push("answers") if new_candidates?
          "New #{items.join(" and ")} on Hyperarchy"
        end
      end

      def new_elections?
        sections.any? {|section| !section.elections_section.nil? }
      end

      def new_candidates?
        sections.any? {|section| !section.candidates_section.nil? }
      end

      class MembershipSection
        attr_reader :membership, :period, :candidates_section, :elections_section, :item

        def initialize(membership, period, item=nil)
          @membership = membership
          @period = period
          @item = item

          if period == "immediately"
            build_immediate_notification_section
          else
            build_periodic_notification_sections
          end
        end

        def build_immediate_notification_section
          case item
            when Election
              @elections_section = ElectionsSection.new(membership, period, item)
            when Candidate
              @candidates_section = CandidatesSection.new(membership, period, item)
            else
              raise "Can't build a notification for this kind of object"
          end
        end

        def build_periodic_notification_sections
          if membership.wants_candidate_notifications?(period)
            @candidates_section = CandidatesSection.new(membership, period)
            @candidates_section = nil if candidates_section.num_candidates == 0
          end

          if membership.wants_election_notifications?(period)
            @elections_section = ElectionsSection.new(membership, period)
            @elections_section = nil if elections_section.num_elections == 0
          end
        end

        def add_lines(lines)
          candidates_section.add_lines(lines) if candidates_section
          elections_section.add_lines(lines) if elections_section
          lines.push("", "", "")
        end

        def organization
          membership.organization
        end
      end

      class CandidatesSection
        attr_reader :membership, :period, :candidate_groups_by_election_id, :num_candidates

        def initialize(membership, period, immediate_candidate=nil)
          @membership = membership
          @period = period
          @num_candidates = 0
          @candidate_groups_by_election_id = Hash.new do |h,election_id|
            h[election_id] = CandidateGroup.new(Election.find(election_id))
          end

          if period == "immediately"
            candidate_groups_by_election_id[immediate_candidate.election_id].add_candidate(immediate_candidate)
          else
            new_candidates.each do |candidate|
              @num_candidates += 1
              candidate_groups_by_election_id[candidate.election_id].add_candidate(candidate)
            end
          end
        end

        def add_lines(lines)
          lines.push(headline, "")
          candidate_groups.each do |candidate_group|
            candidate_group.add_lines(lines)
          end
        end

        def headline
          questions = num_candidates == 1 ? "a question" : "questions"
          "There #{"is".numberize(num_candidates)} #{num_candidates} new #{"answer".numberize(num_candidates)} to #{questions} you voted on:"
        end

        def new_candidates
          membership.new_candidates_in_period(period)
        end

        def candidate_groups
          candidate_groups_by_election_id.values.sort_by do |candidate_group|
            candidate_group.election.score
          end.reverse
        end
      end

      class CandidateGroup
        attr_reader :election

        def initialize(election)
          @election = election
          @candidates = []
        end

        def add_lines(lines)
          lines.push("Question: #{election.body}")
          candidates.each do |candidate|
            lines.push("* #{candidate.body} --#{candidate.creator.full_name}")
          end
          lines.push("To vote on this question, visit: #{election.full_url}", "")
        end

        def add_candidate(candidate)
          @candidates.push(candidate)
        end

        def candidates
          @candidates.sort_by(&:position)
        end
      end

      class ElectionsSection
        attr_reader :membership, :period, :elections

        def initialize(membership, period, immediate_election=nil)
          @membership = membership
          @period = period

          if period == "immediately"
            @elections = [immediate_election]
          else
            @elections = membership.new_elections_in_period(period).all
          end
        end

        def add_lines(lines)
          lines.push(headline, "")
          elections.each do |election|
            lines.push("#{election.body} --#{election.creator.full_name}")
            lines.push("to vote on this question, visit: #{election.full_url}", "")
          end
        end

        def headline
          "There #{"is".numberize(num_elections)} #{num_elections} new #{"question".numberize(num_elections)}:"
        end

        def num_elections
          elections.size
        end
      end
    end
  end
end
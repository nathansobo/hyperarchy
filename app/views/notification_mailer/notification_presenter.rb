module Views
  module NotificationMailer
    class NotificationPresenter
      include HeadlineGeneration

      attr_reader :user, :period, :item, :membership_presenters
      attr_accessor :new_question_count, :new_answer_count, :new_comment_count

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
        @membership_presenters = user.memberships_to_notify(period).map do |membership|
          presenter = MembershipPresenter.new(membership, period, nil)
          presenter unless presenter.empty?
        end.compact
      end

      def gather_counts
        @new_question_count = 0
        @new_answer_count = 0
        @new_comment_count = 0

        membership_presenters.each do |presenter|
          self.new_question_count += presenter.new_question_count
          self.new_answer_count += presenter.new_answer_count
          self.new_comment_count += presenter.new_comment_count
        end
      end

      def subject
        "#{item_counts} on Hyperarchy"
      end

      def empty?
        membership_presenters.empty?
      end

      def multiple_memberships?
        membership_presenters.length > 1
      end

      def to_s(template)
        lines = []
        membership_presenters.each do |presenter|
          lines.push(presenter.organization.name) if multiple_memberships?
          lines.push("")
          presenter.add_lines(template, lines)
          lines.push("", "", "")
        end
        lines.join("\n")
      end
    end
  end
end


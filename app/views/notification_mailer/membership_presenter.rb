module Views
  module NotificationMailer
    class MembershipPresenter
      include HeadlineGeneration

      attr_reader :membership, :period, :item
      attr_reader :question_presenters_by_question, :candidate_presenters_by_candidate
      attr_accessor :new_question_count, :new_candidate_count, :new_comment_count
      delegate :organization, :to => :membership

      def initialize(membership, period, item)
        @membership, @period, @item = membership, period, item
        @question_presenters_by_question = {}
        @candidate_presenters_by_candidate = {}
        @new_question_count = 0
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
          when Question
            add_new_question(item)
          when Candidate
            add_new_candidate(item)
          when CandidateComment
            add_new_comment(item)
          else
            raise "No notification mechanism implemented for item: #{item.inspect}"
        end
      end

      def build_periodic_notification
        if membership.wants_question_notifications?(period)
          membership.new_questions_in_period(period).each do |question|
            add_new_question(question)
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

      def add_new_question(question)
        self.new_question_count += 1
        question_presenters_by_question[question] = QuestionPresenter.new(question, true)
      end

      def add_new_candidate(candidate)
        self.new_candidate_count += 1
        question = candidate.question
        build_question_presenter_if_needed(question)
        question_presenters_by_question[question].add_new_candidate(candidate)
      end

      def add_new_comment(comment)
        self.new_comment_count += 1
        question = comment.question
        build_question_presenter_if_needed(question)
        question_presenters_by_question[question].add_new_comment(comment)
      end

      def build_question_presenter_if_needed(question)
        return if question_presenters_by_question.has_key?(question)
        question_presenters_by_question[question] = QuestionPresenter.new(question, false)
      end

      def question_presenters
        question_presenters_by_question.values.sort_by(&:score).reverse!
      end

      def headline
        "#{item_counts}:"
      end

      def empty?
        new_question_count == 0 && new_candidate_count == 0 && new_comment_count == 0
      end

      def add_lines(template, lines)
        lines.push(headline, "")

        question_presenters.each do |presenter|
          presenter.add_lines(template, lines)
        end
      end
    end
  end
end

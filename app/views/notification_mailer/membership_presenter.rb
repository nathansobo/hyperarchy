#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Views
  module NotificationMailer
    class MembershipPresenter
      include HeadlineGeneration

      attr_reader :membership, :period, :item
      attr_reader :question_presenters_by_question, :answer_presenters_by_answer
      attr_accessor :new_question_count, :new_answer_count, :new_comment_count
      delegate :organization, :to => :membership

      def initialize(membership, period, item)
        @membership, @period, @item = membership, period, item
        @question_presenters_by_question = {}
        @answer_presenters_by_answer = {}
        @new_question_count = 0
        @new_answer_count = 0
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
          when Answer
            add_new_answer(item)
          when AnswerComment
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

        if membership.wants_answer_notifications?(period)
          membership.new_answers_in_period(period).each do |answer|
            add_new_answer(answer)
          end
        end

        if membership.wants_own_answer_comment_notifications?(period)
          membership.new_comments_on_own_answers_in_period(period).each do |comment|
            add_new_comment(comment)
          end
        end

        if membership.wants_ranked_answer_comment_notifications?(period)
          membership.new_comments_on_ranked_answers_in_period(period).each do |comment|
            add_new_comment(comment)
          end
        end
      end

      def add_new_question(question)
        self.new_question_count += 1
        question_presenters_by_question[question] = QuestionPresenter.new(question, true)
      end

      def add_new_answer(answer)
        self.new_answer_count += 1
        question = answer.question
        build_question_presenter_if_needed(question)
        question_presenters_by_question[question].add_new_answer(answer)
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
        new_question_count == 0 && new_answer_count == 0 && new_comment_count == 0
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

module Views
  module NotificationMailer
    class QuestionPresenter
      attr_reader :question, :question_is_new
      attr_reader :answer_presenters_by_answer
      delegate :score, :to => :question

      def initialize(question, question_is_new)
        @question, @question_is_new = question, question_is_new

        @answer_presenters_by_answer = {}

        # show all answers of a new question
        if question_is_new
          question.answers.each do |answer|
            answer_presenters_by_answer[answer] = AnswerPresenter.new(answer, true)
          end
        end
      end

      def add_new_answer(answer)
        return if question_is_new # already have all the answers
        answer_presenters_by_answer[answer] = AnswerPresenter.new(answer, true)
      end

      def add_new_comment(comment)
        answer = comment.answer
        build_answer_presenter_if_needed(answer)
        answer_presenters_by_answer[answer].add_new_comment(comment)
      end

      def build_answer_presenter_if_needed(answer)
        return if question_is_new || answer_presenters_by_answer.has_key?(answer)
        answer_presenters_by_answer[answer] = AnswerPresenter.new(answer, false)
      end

      def answer_presenters
        answer_presenters_by_answer.values.sort_by(&:position)
      end

      def add_lines(template, lines)
        lines.push("Question:")
        lines.push("#{question.body} -- #{question.creator.full_name}")
        lines.push("view at: #{template.question_url(question)}")
        lines.push("")
        answer_presenters.each do |presenter|
          presenter.add_lines(template, lines)
        end
        lines.push("--------------------", "")
      end
    end
  end
end

module Views
  module NotificationMailer
    class QuestionPresenter
      attr_reader :question, :question_is_new
      attr_reader :candidate_presenters_by_candidate
      delegate :score, :to => :question

      def initialize(question, question_is_new)
        @question, @question_is_new = question, question_is_new

        @candidate_presenters_by_candidate = {}

        # show all candidates of a new question
        if question_is_new
          question.candidates.each do |candidate|
            candidate_presenters_by_candidate[candidate] = CandidatePresenter.new(candidate, true)
          end
        end
      end

      def add_new_candidate(candidate)
        return if question_is_new # already have all the candidates
        candidate_presenters_by_candidate[candidate] = CandidatePresenter.new(candidate, true)
      end

      def add_new_comment(comment)
        candidate = comment.candidate
        build_candidate_presenter_if_needed(candidate)
        candidate_presenters_by_candidate[candidate].add_new_comment(comment)
      end

      def build_candidate_presenter_if_needed(candidate)
        return if question_is_new || candidate_presenters_by_candidate.has_key?(candidate)
        candidate_presenters_by_candidate[candidate] = CandidatePresenter.new(candidate, false)
      end

      def candidate_presenters
        candidate_presenters_by_candidate.values.sort_by(&:position)
      end

      def add_lines(template, lines)
        lines.push("Question:")
        lines.push("#{question.body} -- #{question.creator.full_name}")
        lines.push("view at: #{template.question_url(question)}")
        lines.push("")
        candidate_presenters.each do |presenter|
          presenter.add_lines(template, lines)
        end
        lines.push("--------------------", "")
      end
    end
  end
end

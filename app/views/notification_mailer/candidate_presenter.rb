module Views
  module NotificationMailer
    class CandidatePresenter
      attr_reader :candidate, :candidate_is_new, :new_comments
      delegate :position, :to => :candidate

      def initialize(candidate, candidate_is_new)
        @candidate, @candidate_is_new = candidate, candidate_is_new
        @new_comments = []
      end

      def add_new_comment(comment)
        new_comments.push(comment)
      end

      def add_lines(lines)
        lines.push("Answer:")
        lines.push(candidate.body)
        lines.push("suggested by #{candidate.creator.full_name}")
        lines.push("")
        lines.push("Comments:") unless new_comments.empty?
        new_comments.each do |comment|
          lines.push("#{comment.body} -- #{candidate.creator.full_name}", "")
        end
        lines.push("")
      end
    end
  end
end

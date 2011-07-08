module Views
  module NotificationMailer
    class AnswerPresenter
      attr_reader :answer, :answer_is_new, :new_comments
      delegate :position, :to => :answer

      def initialize(answer, answer_is_new)
        @answer, @answer_is_new = answer, answer_is_new
        @new_comments = []
      end

      def add_new_comment(comment)
        new_comments.push(comment)
      end

      def add_lines(template, lines)
        lines.push("Answer:")
        lines.push(answer.body)
        lines.push("suggested by #{answer.creator.full_name}")
        lines.push("")
        lines.push("Comments:") unless new_comments.empty?
        new_comments.each do |comment|
          lines.push("#{comment.body} -- #{answer.creator.full_name}", "")
        end
        lines.push("")
      end
    end
  end
end

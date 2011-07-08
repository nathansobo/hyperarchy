module Views
  module NotificationMailer
    module HeadlineGeneration
      include ActionView::Helpers::TextHelper

      def item_counts
        items = []

        items.push(pluralize(new_question_count, 'new question')) if new_question_count > 0
        items.push(pluralize(new_answer_count, 'new answer')) if new_answer_count > 0
        items.push(pluralize(new_comment_count, 'new comment')) if new_comment_count > 0

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
  end
end

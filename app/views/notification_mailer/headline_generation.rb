module Views
  module NotificationMailer
    module HeadlineGeneration
      def item_counts
        items = []
        items.push("#{new_election_count} new #{'question'.numberize(new_election_count)}") if new_election_count > 0
        items.push("#{new_candidate_count} new #{'answer'.numberize(new_candidate_count)}") if new_candidate_count > 0
        items.push("#{new_comment_count} new #{'comment'.numberize(new_comment_count)}") if new_comment_count > 0

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

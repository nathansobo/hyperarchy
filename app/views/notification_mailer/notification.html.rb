module Views
  module NotificationMailer
    class Notification < Erector::Widget
      attr_reader :presenter

      def content
        html do
          body do
            div :style => "font-size: 14px; font-family: 'Helvetica Neue', Arial, 'Liberation Sans', FreeSans, sans-serif;"  do
              presenter.membership_presenters.each do |membership_presenter|
                membership_section(membership_presenter)
              end
              div :style => "margin-top: 20px; width: 550px;" do
                rawtext "To change the frequency of these notifications or unsubscribe entirely, "
                a "visit your account preferences page", :href => account_url, :style => "color: #000094; white-space: nowrap;"
                text "."
              end
            end
          end
        end
      end

      def membership_section(presenter)
        if num_membership_presenters > 1
          h1 "#{presenter.organization.name}", :style => "font-size: 22px;"
        end
        h2 presenter.headline
        presenter.question_presenters.each do |question_presenter|
          question_section(question_presenter)
        end
      end

      def question_section(presenter)
        question = presenter.question

        color = presenter.question_is_new ? "black" : "#888"

        div :style => "background: #eee; border: 1px solid #DDD; margin-bottom: 10px; max-width: 500px; color: #{color};" do
          div :style => "margin: 8px;" do
            a "View Question", :href => question_url(question), :style => "float: right; padding: 5px 15px; background: white; margin-left: 10px; color: #000094;"
            div question.body, :style => "padding: 0px; padding-top: 5px;"
            div :style => "clear: both;"
          end

          unless presenter.answer_presenters.empty?
            div :style => "max-height: 400px; overflow-y: auto; padding: 0px 8px; margin-top: 8px;" do
              div :style => "margin-top: 8px;" do
                presenter.answer_presenters.each do |answer_presenter|
                  answer_section(answer_presenter)
                end
              end
            end
          end
        end
      end

      def answer_section(presenter)
        answer = presenter.answer
        color = presenter.answer_is_new ? "black" : "#888"

        div :style => "margin-bottom: 8px; background: white; color: #{color};" do
          div answer.body, :style => "float: left; padding: 8px; margin-bottom: -8px;"
          div raw("&mdash;#{answer.creator.full_name}"), :style => "white-space: nowrap; float: right; font-style: italic; color: #777; padding: 8px;"
          div :style => "clear: both;"

          unless presenter.new_comments.empty?
            div :style => "padding: 8px; padding-top: 0px;" do
              div :style => "padding: 8px; background: white; color: black; border: 2px solid #ddd; font-size: 13px;" do
                div "Comments", :style => "margin-bottom: 16px; font-weight: bold;"
                presenter.new_comments.each do |comment|
                  comment_section(comment)
                end
              end
            end
          end
        end
      end

      def comment_section(comment)
        div do
          div :style => "color: #777; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px;" do
            div comment.creator.full_name, :style => "font-style: italic;"
          end

          div comment.body, :style => "margin-bottom: 16px;"
        end
      end

      def num_membership_presenters
        presenter.membership_presenters.length
      end
    end
  end
end
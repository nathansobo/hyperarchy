module Hyperarchy
  module Emails
    class Notification < Erector::Widget
      attr_reader :notification_presenter

      def content
        html do
          body do
            div :style => "font-size: 14px; font-family: 'Helvetica Neue', Arial, 'Liberation Sans', FreeSans, sans-serif;"  do
              notification_presenter.membership_presenters.each do |membership_presenter|
                membership_section(membership_presenter)
              end
              div :style => "margin-top: 20px; width: 550px;" do
                rawtext "To change the frequency of these notifications or unsubscribe entirely, "
                a "visit your account preferences page", :href => "https://#{HTTP_HOST}/app#view=account", :style => "color: #000094; white-space: nowrap;"
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
        presenter.election_presenters.each do |election_presenter|
          election_section(election_presenter)
        end
      end


      def election_section(presenter)
        election = presenter.election

        color = presenter.election_is_new ? "black" : "#888"

        div :style => "background: #eee; border: 1px solid #DDD; margin-bottom: 10px; max-width: 500px; color: #{color};" do
          div :style => "margin: 8px;" do
            a "View Question", :href => "https://#{HTTP_HOST}/app#view=election&electionId=#{election.id}", :style => "float: right; padding: 5px 15px; background: white; margin-left: 10px; color: #000094;"
            div election.body, :style => "padding: 0px; padding-top: 5px;"
            div :style => "clear: both;"
          end

          unless presenter.candidate_presenters.empty?
            div :style => "max-height: 400px; overflow-y: auto; padding: 0px 8px; margin-top: 8px;" do
              div :style => "margin-top: 8px;" do
                presenter.candidate_presenters.each do |candidate_presenter|
                  candidate_section(candidate_presenter)
                end
              end
            end
          end
        end
      end

      def candidate_section(presenter)
        candidate = presenter.candidate
        color = presenter.candidate_is_new ? "black" : "#888"

        div :style => "margin-bottom: 8px; background: white; color: #{color};" do
          div candidate.body, :style => "float: left; padding: 8px; margin-bottom: -8px;"
          div raw("&mdash;#{candidate.creator.full_name}"), :style => "white-space: nowrap; float: right; font-style: italic; color: #777; padding: 8px;"
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
        notification_presenter.membership_presenters.length
      end
    end
  end
end
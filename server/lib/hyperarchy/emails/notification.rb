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

        div :style => "background: #eee; border: 1px solid #DDD; margin-bottom: 10px; padding: 8px; max-width: 500px; color: #{color};" do
          a "Vote", :href => "https://#{HTTP_HOST}/app#view=election&electionId=#{election.id}", :style => "float: right; padding: 5px 15px; background: white; margin-left: 10px; color: #000094;"
          div election.body, :style => "padding: 0px; margin-bottom: 15px;"

          presenter.candidate_presenters.each do |candidate_presenter|
            candidate_section(candidate_presenter)
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
        end
      end

      def num_membership_presenters
        notification_presenter.membership_presenters.length
      end
    end
  end
end
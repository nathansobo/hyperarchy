module Hyperarchy
  module Emails
    class Notification < Erector::Widget
      attr_reader :notification_presenter

      def content
        html do
          body do
            div :style => "font-size: 14px; font-family: 'Helvetica Neue', Arial, 'Liberation Sans', FreeSans, sans-serif;"  do
              num_sections = notification_presenter.sections.length

              notification_presenter.sections.each do |section|
                if num_sections > 1
                  h1 "#{section.organization.name}", :style => "font-size: 22px;"
                end

                if candidates_section = section.candidates_section
                  num_candidates = candidates_section.num_candidates
                  num_questions = candidates_section.candidate_groups.length
                  questions = num_questions == 1 ? "a question" : "questions"

                  div :style => "margin-bottom: 20px" do
                    h2 candidates_section.headline, :style => "font-size: 18px;"

                    candidates_section.candidate_groups.each do |candidate_group|
                      div :style => "background: #eee; border: 1px solid #ddd; margin-bottom: 10px; padding: 8px; max-width: 500px;" do
                        a "Vote", :href => "https://#{HTTP_HOST}/app#view=election&electionId=#{candidate_group.election.id}", :style => "float: right; padding: 5px 15px; background: white; margin-left: 10px; color: #000094;"

                        div candidate_group.election.body, :style => "padding: 0px; margin-bottom: 15px;"

                        candidate_group.candidates.each do |candidate|
                          div :style => "margin-bottom: 8px; background: white;" do
                            div candidate.body, :style => "float: left; padding: 8px; margin-bottom: -8px;"
                            div raw("&mdash;#{candidate.creator.full_name}"), :style => "white-space: nowrap; float: right; font-style: italic; color: #777; padding: 8px;"
                            div :style => "clear: both;"
                          end
                        end
                      end
                    end
                  end
                end

                if elections_section = section.elections_section
                  num_elections = elections_section.num_elections
                  heading = "There #{"is".numberize(num_elections)} #{num_elections} new #{"question".numberize(num_elections)}:"
                  h2 heading, :style => "font-size: 18px;"

                  elections_section.elections.each do |election|
                    div :style => "background: #eee; border: 1px solid #ddd; margin-bottom: 10px; padding: 8px; max-width: 500px;" do
                      a "Vote", :href => "https://#{HTTP_HOST}/app#view=election&electionId=#{election.id}", :style => "float: right; padding: 5px 15px; background: white; margin-left: 10px; color: #000094; margin-bottom: 8px;"
                      div :style => "background: white; width: 430px;" do
                        div election.body, :style => "padding: 8px; float: left; margin-bottom: -8px;"
                        div raw("&mdash;#{election.creator.full_name}"), :style => "padding: 8px; float: right; color: #777; font-style: italic;"
                        div :style => "clear: both;"
                      end
                      div :style => "clear: both;"
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
  end
end
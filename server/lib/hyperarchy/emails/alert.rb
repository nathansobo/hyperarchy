module Hyperarchy
  module Emails
    class Alert < Erector::Widget
      attr_reader :alert_presenter

      def content
        html do
          body :style => "font: 14px/1.3 'Helvetica Neue', Arial, 'Liberation Sans', FreeSans, sans-serif;" do

            num_sections = alert_presenter.sections.length

            alert_presenter.sections.each do |section|
              if num_sections > 1
                h1 "#{section.organization.name} Activity", :style => "font-size: 22px;"
              end

              if candidates_section = section.candidates_section
                num_candidates = candidates_section.num_candidates
                num_questions = candidates_section.candidate_groups.length
                questions = num_questions == 1 ? "a question" : "questions"
                heading = "There #{"is".numberize(num_candidates)} #{num_candidates} new #{"answer".numberize(num_candidates)} to #{questions} you previously voted on:"


                div :style => "margin-bottom: 20px" do
                  h2 heading, :style => "font-size: 18px;"

                  candidates_section.candidate_groups.each do |candidate_group|
                    div :style => "background: #eee; border: 1px solid #ddd; margin-bottom: 10px; padding: 5px; max-width: 600px;" do
                      div candidate_group.election.body, :style => "font-weight: bold; margin-bottom: 5px;"

                      table :cellpadding => 0, :style => "border-collapse: separate; width: 100%; border-spacing: 0px 3px; font-size: 14px;" do
                        candidate_group.candidates.each do |candidate|
                          tr do
                            td "#{candidate.creator.full_name}:", :style => "padding: 4px 8px 4px 0px; white-space: nowrap; vertical-align: top;"
                            td candidate.body, :style => "padding: 4px; width: 100%; vertical-align: top; background: white;"
                          end
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
                  div :style => "background: #eee; border: 1px solid #ddd; margin-bottom: 10px; padding: 5px; max-width: 600px;" do

                    table :style => "border-collapse: separate; width: 100%; border-spacing: 0px 3px; font-size: 14px;" do
                      tr do
                        td election.creator.full_name, :style => "padding: 4px 8px 4px 0px; white-space: nowrap; vertical-align: top;"
                        td election.body, :style => "padding: 4px; width: 100%; vertical-align: top; background: white;"
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
end
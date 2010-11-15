HYPERARCHY_BLURB =       %{Hyperarchy helps your organization track its own collective opinion.
It lets you put any issue to a vote by raising questions, then allows members to suggest and rank answers to these questions.
As individuals change their rankings, Hyperarchy computes and broadcasts the evolving consensus in real time, making it easier to communicate and make decisions.}

module Views
  class Home < Layout
    def body_content
      div :id => "notification", :style => "display: none"

      div :id => "header", :class => "container12" do
        div :class => "grid6" do
          div :id => "smallLogo"
        end
        div :id => "links", :class => "grid6" do
          a :id => "logIn", :href => "/login"
          a :id => "signUp", :href => "/signup"
        end
        div :class => "clear"
      end

      div :class => "container12" do
        div :class => "grid12", :style => "text-align: center;" do
          div "Help your team hear itself think.", :id => "headline"
          div "Real-time collaborative decision making for organizations", :id => "tagline"
        end
        div :class => "clear"
      end

      div :class => "container12" do
        div :class => "grid6" do
          div :id => "screenshot"
        end

        div :class => "grid6" do
          ol :id => "description" do
            li "Converge on the best answers to your team's most important questions."
            li "Vote by ranking your favorite ideas and watch Hyperarchy compute the consensus instantly."
            li "Build shared confidence in your team's direction. Cut through confusion and resolve debates."
          end
        end

        div :class => "clear"
      end

      div :id => "lowerRegion", :class => "container12" do
        div :class => "grid4 prefix1 suffix1" do
          a "Learn More", :href => "/learn_more", :id => "learnMoreButton", :class => "roundedButton glossyBlack"
          div "View screenshots and learn how Hyperarchy can help your team.", :class => "buttonDescription"
        end
        div :class => "grid4 prefix1 suffix1" do
          a "Sign Up Free", :href => "/signup", :id => "signUpButton", :class => "roundedButton glossyBlack"
          div "Invite your teammates and start voting on your first question now.", :class => "buttonDescription"
        end
        div :class => "clear"
      end
    end

    def head_content
      javascript_include "underscore", "jquery-1.4.2"

      javascript %[
        $(function() {
          var notification = #{flash[:notification].to_json};
          if (notification) {
            var box = $("#notification");
            box.html(notification);
            box.slideDown();
            _.delay(function() {
              box.slideUp('fast');
              box.empty();
            }, 4000);
          }

          mpmetrics.track('view home page');
        });
      ]
    end

    def description
      HYPERARCHY_BLURB
    end
  end
end
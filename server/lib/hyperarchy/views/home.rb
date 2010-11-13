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
      end

      div :class => "container12" do
        div :class => "grid6" do
          div :id => "screenshot"
        end

        div :class => "grid6" do
          div "Know where everyone stands before everyone sits down.", :id => "headline"
          div "Micro-elections make it easy for your organization to put anything to a vote. Raise a question, then watch in real time as your team suggests and ranks answers. Hyperarchy computes the consensus instantly using a state-of-the-art electoral algorithm.", :id => "description"


#          ol :id => "description" do
#            li "Micro-elections make it easy for your organization to put anything to a vote."
#            li "Raise a question, then watch in real time as your team suggests and ranks answers."
#            li "Hyperarchy computes the consensus instantly using a state-of-the-art electoral algorithm."
#          end
        end

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
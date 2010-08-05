HYPERARCHY_BLURB =       %{Hyperarchy helps your organization track its own collective opinion.
It lets you put any issue to a vote by raising questions, then allows members to suggest and rank answers to these questions.
As individuals change their rankings, Hyperarchy computes and broadcasts the evolving consensus in real time, making it easier to communicate and make decisions.}

module Views
  class Home < Layout
    def body_content
      div :id => "notification", :style => "display: none"

      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "bigLogo"
        end

        div :id => "description", :class => "grid10 prefix1 suffix1" do
          rawtext description
        end

        div :id => "signUpOrLogIn", :class => "grid10 prefix1 suffix1" do
          a :id => "signUp", :href => "/signup"
          a :id => "logIn", :href => "/login"
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
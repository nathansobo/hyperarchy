module Views
  module Home
    class Show < Views::Layouts::Application
      def track_pageview_manually?
        true
      end

      def below_body_content
        application_javascript_tags
        script :type => "text/javascript", :language => "javascript", :src => "https://#{request.host}:8081/socket.io/socket.io.js"

        javascript %[
        $(function() {
          window.WEB_SOCKET_SWF_LOCATION = 'https://#{request.host}:8081/socket.io/lib/vendor/web-socket-js/WebSocketMain.swf';
          Election.SCORE_EXTRA_VOTES = #{Election::SCORE_EXTRA_VOTES};
          Election.SCORE_EXTRA_HOURS = #{Election::SCORE_EXTRA_HOURS};
          Election.SCORE_GRAVITY = #{Election::SCORE_GRAVITY};
          #{store_in_repository(current_user.initial_repository_contents)}
          window.Application = new Controllers.Application(#{(current_user ? current_user.id : nil).to_json});
          Application.environment = #{Rails.env.to_json};
          window.Application.initializeNavigation();
        });
      ]
      end

      def body_content
        div :id => "loadingPage" do
          div :id => "mediumLogo"
          div :class => "bigLoading matchesBodyBackground"
        end
      end

      def application_javascript_tags
        javascript_include("app")
      end
    end
  end
end

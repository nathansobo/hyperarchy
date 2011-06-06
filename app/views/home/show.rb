module Views
  module Home
    class Show < Views::Layouts::Application
      def track_pageview_manually?
        true
      end

      def below_body_content
        javascript_include_tag("application", :debug => false)

        javascript %[
        $(function() {
          window.WEB_SOCKET_SWF_LOCATION = '/WebSocketMain.swf';
          Election.SCORE_EXTRA_VOTES = #{Election::SCORE_EXTRA_VOTES};
          Election.SCORE_EXTRA_HOURS = #{Election::SCORE_EXTRA_HOURS};
          Election.SCORE_GRAVITY = #{Election::SCORE_GRAVITY};
          #{store_in_repository(current_user.initial_repository_contents)}
          window.Application = new Controllers.Application(#{(current_user ? current_user.id : nil).to_json});
          Application.environment = #{Rails.env.to_json};
          Application.HTTP_HOST = #{request.host.to_json};
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
    end
  end
end

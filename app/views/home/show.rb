module Views
  module Home
    class Show < Views::Layouts::Application
      def track_pageview_manually?
        true
      end

      def below_body_content
        javascript_include_tag("application", :debug => Rails.env.development?)
        javascript %[
        $(function() {
          window.WEB_SOCKET_SWF_LOCATION = '/WebSocketMain.swf';
          Question.SCORE_EXTRA_VOTES = #{Question::SCORE_EXTRA_VOTES};
          Question.SCORE_EXTRA_HOURS = #{Question::SCORE_EXTRA_HOURS};
          Question.SCORE_GRAVITY = #{Question::SCORE_GRAVITY};
          #{store_in_repository(current_user.initial_repository_contents)}
          window.Application = Views.Layout.toView();
          Application.environment = #{Rails.env.to_json};
          $('body').html(Application);
          Application.attach();
          Application.currentUserId(#{current_user_id});
          Path.listen();
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

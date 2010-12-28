module Views
  class App < Views::Layout
    def track_pageview_manually?
      true
    end

    def below_body_content
      application_javascript_tags
      javascript %[
        $(function() {
          Election.SCORE_EXTRA_VOTES = #{Election::SCORE_EXTRA_VOTES};
          Election.SCORE_EXTRA_HOURS = #{Election::SCORE_EXTRA_HOURS};
          Election.SCORE_GRAVITY = #{Election::SCORE_GRAVITY};
          #{store_organizations_in_repository}
          #{store_current_user_in_repository}
          Server.realTimeClientId(#{Guid.new.to_s.inspect});
          window.Application = new Controllers.Application(#{(current_user ? current_user.id : nil).to_json});
          Application.environment = #{RACK_ENV.to_json};
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

    def store_organizations_in_repository
      if current_user.admin?
        store_in_repository(Organization.table)
      else
        store_in_repository(current_user.organizations)
      end
    end

    def store_current_user_in_repository
      store_in_repository(current_user) + "\n" +
        store_in_repository(current_user.memberships)
    end

    def application_javascript_tags
      javascript_include("application")
    end
  end
end

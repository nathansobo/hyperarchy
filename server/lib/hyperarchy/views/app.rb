module Views
  class App < Views::Layout
    def head_content
      application_javascript_tags
      javascript %[
        $(function() {
          #{store_organizations_in_repository}
          #{store_current_user_in_repository}
          window.Application = new Controllers.Application(#{(current_user ? current_user.id : nil).to_json});
          window.Application.initializeNavigation();
        });
      ]
    end

    def store_organizations_in_repository
      store_in_repository(Organization.table)
    end

    def store_current_user_in_repository
      store_in_repository(current_user) if current_user
    end

    def application_javascript_tags
      javascript_include("application.js")
    end
  end
end

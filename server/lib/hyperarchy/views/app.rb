module Views
  class App < Views::Layout
    needs :current_user

    def head_content
      application_javascript_tags
      script :type => "text/javascript", :language => "javascript" do
        rawtext %[
          $(function() {
            #{store_organizations_in_repository}
            #{store_current_user_in_repository}
            window.Application = new Controllers.Application(#{(current_user ? current_user.id : nil).to_json});
            window.Application.initializeNavigation();
          });
        ]
      end
    end

    def store_organizations_in_repository
      store_in_repository(Organization.table)
    end

    def store_current_user_in_repository
      store_in_repository(current_user) if current_user
    end

    def application_javascript_tags
      Monarch.virtual_dependency_paths_from_load_path('application.js').each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end
  end
end

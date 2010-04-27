module Views
  class Root < Erector::Widget
    include Util::BuildRelationalDataset

    needs :current_user

    def content
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/reset.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/960.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/text.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/hyperarchy.css"
          application_javascript_tags

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

        body do
        end
      end
    end

    def store_organizations_in_repository
      store_in_repository(Organization.table)
    end

    def store_current_user_in_repository
      store_in_repository(current_user) if current_user
    end

    def store_in_repository(dataset)
      %{Repository.update(#{build_relational_dataset(dataset).to_json});}
    end


    def application_javascript_tags
      Monarch.virtual_dependency_paths_from_load_path('application.js').each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end
  end
end

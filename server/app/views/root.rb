module Views
  class Root < Erector::Widget
    def content
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/reset.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/960.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/text.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/hyperarchy.css"
          application_javascript_tags
          
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/hyperarchy.css"

          application_javascript_tags
          script :type => "text/javascript", :language => "javascript" do
            rawtext %[
              window.COMET_CLIENT_ID = #{Guid.new.to_s.to_json};
              $(function() { window.Application = new Controllers.Application() });
            ]
          end
        end

        body do
        end
      end
    end


    def application_javascript_tags
      Util::AssetManager.virtual_dependency_paths_from_load_path('application.js').each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end
  end
end

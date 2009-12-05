module Views
  class Root < Erector::Widget
    def content
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "http://yui.yahooapis.com/2.7.0/build/reset/reset-min.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/hyperarchy.css"
          application_javascript_tags
          script :type => "text/javascript", :language => "javascript" do
            rawtext %[window.COMET_CLIENT_ID = #{Guid.new.to_s.to_json};]
            rawtext %[jQuery(function() { jQuery("#placeholder").replaceWith(Views.Application.to_view()); });]
          end
        end

        body do
          div :id => "placeholder"
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

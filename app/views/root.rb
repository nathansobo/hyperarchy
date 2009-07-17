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
            rawtext %[$(function() { $("#placeholder").replaceWith(Views.Application.to_view()); });]
          end
        end

        body do
          div :id => "placeholder"
        end
      end
    end


    def application_javascript_tags
      application_javascript_relative_paths.each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end


    def application_javascript_relative_paths
      public_dir_path = "#{ROOT}/public"
      javascript_dir_path = "#{public_dir_path}/javascript"
      secretary = Sprockets::Secretary.new(
        :root => javascript_dir_path,
        :asset_root   => public_dir_path,
        :load_path    => ["#{javascript_dir_path}", "#{javascript_dir_path}/**/*"],
        :source_files => ["hyperarchy.js"]
      )
      secretary.preprocessor.dependency_ordered_source_files.map do |f|
        f.pathname.absolute_location.gsub(public_dir_path, "")
      end
    end

  end
end
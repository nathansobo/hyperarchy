module Views
  class Layout < Erector::Widget
    include Monarch::Util::BuildRelationalDataset

    def content
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/reset.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/960.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/text.css"
          link :rel => "stylesheet", :type => "text/css", :href => "stylesheets/hyperarchy.css"

          head_content
        end

        body :class => self.class.basename.underscore do
          body_content
        end
      end
    end

    def head_content
    end

    def body_content
    end

    def store_in_repository(dataset)
      %{Repository.update(#{build_relational_dataset(dataset).to_json});}
    end

    def javascript(text=nil, &block)
      script :type => "text/javascript", :language => "javascript" do
        rawtext text if text
        yield if block
      end
    end

    def javascript_include(path_relative_to_load_path)
      Monarch.virtual_dependency_paths_from_load_path(path_relative_to_load_path).each do |path|
        script :type => "text/javascript", :language => "javascript", :src => path
      end
    end

    def method_missing(method, *args, &block)
      if helpers && helpers.respond_to?(method)
        helpers.send(method, *args, &block)
      else
        super
      end
    end
  end
end

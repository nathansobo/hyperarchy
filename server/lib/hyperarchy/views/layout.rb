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
  end
end

module Views
  class Page < Erector::Widget
    def render
      html do
        head do
          title page_title
          script :type => "text/javascript", :language => "javascript", :src => "/all.js"
          if page_specific_javascript
            script :type => "text/javascript", :language => "javascript" do
              rawtext page_specific_javascript
            end
          end
        end

        body do
          content
        end
      end
    end

    def page_title
      "CE2"
    end

    def content
    end
  end
end

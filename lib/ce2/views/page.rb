module Views
  class Page < Erector::Widget
    def render
      html do
        head do
          title page_title
          link :rel => "stylesheet", :type => "text/css", :href => "http://yui.yahooapis.com/2.7.0/build/reset/reset-min.css"
          link :rel => "stylesheet", :type => "text/css", :href => "ce2.css"

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

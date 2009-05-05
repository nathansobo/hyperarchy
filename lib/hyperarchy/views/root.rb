module Views
  class Page < Erector::Widget
    def render
      html do
        head do
          title "Hyperarchy"
          link :rel => "stylesheet", :type => "text/css", :href => "http://yui.yahooapis.com/2.7.0/build/reset/reset-min.css"
          link :rel => "stylesheet", :type => "text/css", :href => "hyperarchy.css"

          script :type => "text/javascript", :language => "javascript", :src => "/all.js"
        end

        body do
          content
        end
      end
    end

    def content
      div :id => "placeholder"
    end
  end
end
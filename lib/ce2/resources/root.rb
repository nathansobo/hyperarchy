module Resources
  class Root
    def locate(path_fragment)
      case path_fragment
      when "domain"
        GlobalDomain.instance
      end
    end

    def get
      [200, headers, content]
    end

    def headers
      { "Content-Type" => "text/html" }
    end

    def content
      View.new.to_pretty
    end
  end

  class View < Erector::Widget
    def render
      html do
        head do
          title "CE2"
          script :type => "text/javascript", :language => "javascript", :src => "/all_javascript.js"
        end
      end
    end
  end
end
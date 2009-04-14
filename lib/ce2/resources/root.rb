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
      js_include_tag "/javascript/vendor/june.js"
      js_include_tag "/javascript/vendor/disco.js"
      js_include_tag "/javascript/ce2.js"
    end
  end
end
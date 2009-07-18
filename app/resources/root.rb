module Resources
  class Root < Http::Resource
    def locate(path_fragment)
      case path_fragment
      when "domain"
        Model::GlobalDomain.instance
      when "users"
        Users.new
      end
    end

    def get(params)
      [200, headers, content]
    end

    def headers
      { "Content-Type" => "text/html" }
    end

    def content
      Views::Root.new.to_pretty
    end
  end
end
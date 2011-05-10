class GiftWrapper
  class Location
    attr_reader :gift_wrapper, :physical_path, :web_path

    def initialize(gift_wrapper, physical_path, web_path)
      @gift_wrapper, @physical_path, @web_path = gift_wrapper, physical_path, web_path
    end

    def resolve_web_path(web_path_to_resolve)
      raise "Web path does not match this location's prefix" unless matches_web_path(web_path_to_resolve)
      resolved_physical_path = web_path_to_resolve.gsub(/^#{self.web_path}/, self.physical_path)
      Location.new(gift_wrapper, resolved_physical_path, web_path_to_resolve)
    end

    def resolve_physical_path(physical_path_to_resolve)
      raise "Physical path does not match this location's prefix" unless matches_physical_path(physical_path_to_resolve)
      resolved_web_path = physical_path_to_resolve.gsub(/^#{self.physical_path}/, self.web_path)
      Location.new(gift_wrapper, physical_path_to_resolve, resolved_web_path)
    end

    def resolve_from_load_path(path_to_resolve)
      relative_physical_path = File.expand_path("#{physical_path}/#{path_to_resolve}")
      if File.exist?(relative_physical_path)
        return JsFile.new(gift_wrapper.resolve_physical_path(relative_physical_path))
      end
    end

    def matches_web_path(web_path_to_match)
      web_path_to_match.index(self.web_path) == 0
    end

    def matches_physical_path(physical_path_to_match)
      physical_path_to_match.index(self.physical_path) == 0
    end

    def file?
      File.file?(physical_path)
    end

    def rack_response
      return rack_forbidden_response if web_path.include?('..')
      Rack::File.new(dirname).call("PATH_INFO" => basename)
    end

    def dirname
      File.dirname(physical_path)
    end

    def basename
      File.basename(physical_path)
    end

    protected

    def rack_forbidden_response
      body = "Forbidden\n"
      headers = {
        "Content-Type" => "text/plain",
        "Content-Length" => body.size.to_s,
        "X-Cascade" => "pass"
      }
      [403, headers, [body]]
    end
  end
end
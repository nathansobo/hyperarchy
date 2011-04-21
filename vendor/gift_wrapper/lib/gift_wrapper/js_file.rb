class GiftWrapper
  class JsFile
    RELATIVE_REQUIRE_REGEX = /^\/\/= require\s+['"]([^'"]+)['"].*/
    LOAD_PATH_REQUIRE_REGEX = /^\/\/= require\s+<([^>]+)>.*/

    attr_reader :location

    def initialize(location)
      @location = location
    end

    def expand_require_graph(require_context)
      return if require_context.already_required?(self)
      each_line do |line, no|
        begin
          if match = RELATIVE_REQUIRE_REGEX.match(line)
            relative_require(match[1], require_context)
          elsif match = LOAD_PATH_REQUIRE_REGEX.match(line)
            load_path_require(match[1], require_context)
          end
        rescue ArgumentError => e
          puts "Error reading #{physical_path} at line #{no}. Re-raising."
          raise e
        end
      end
      require_context.add_require(self)
    end

    def content
      File.read(physical_path)
    end

    def gift_wrapper
      location.gift_wrapper
    end

    def web_path
      location.web_path
    end

    def physical_path
      location.physical_path
    end

    protected

    def relative_require(relative_path, requires)
      relative_physical_path = File.expand_path("#{File.dirname(physical_path)}/#{relative_path}.js")
      js_file = JsFile.new(gift_wrapper.resolve_physical_path(relative_physical_path))
      js_file.expand_require_graph(requires)
    end

    def load_path_require(relative_path, requires)
      gift_wrapper.resolve_from_load_path("#{relative_path}.js").expand_require_graph(requires)
    end

    def each_line(&block)
      File.open(physical_path, "r") do |file|
        file.lines.each_with_index do |line, index|
          block.call(line, index + 1)
        end
      end
    end
  end
end
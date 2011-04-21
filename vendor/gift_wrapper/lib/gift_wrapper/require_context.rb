class GiftWrapper
  class RequireContext
    attr_reader :combine, :requires, :combined_content

    def initialize(combine)
      @combine = combine
      @requires = []
      @combined_content = ""
    end

    def add_require(js_file)
      requires.push(js_file)
      if combine
        combined_content.concat(js_file.content)
        combined_content.concat("\n")
      end
    end

    def already_required?(js_file)
      requires.any? {|required_file| required_file.physical_path == js_file.physical_path}
    end

    def required_web_paths
      requires.map(&:web_path)
    end
  end
end
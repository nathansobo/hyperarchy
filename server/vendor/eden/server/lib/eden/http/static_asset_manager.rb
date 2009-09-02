module Http
  class StaticAssetManager
    class << self
      def instance
        @instance ||= new
      end

      def new(proxied_app=nil)
        @instance ||= super()
        @instance.proxied_app = proxied_app
        @instance
      end

      delegate :call, :add_js_directory, :dependency_paths, :to => :instance
    end

    attr_reader :js_directories_by_virtual_prefix, :js_directories_by_physical_prefix
    attr_accessor :proxied_app

    def initialize
      @proxied_app = proxied_app
      @js_directories_by_physical_prefix = ActiveSupport::OrderedHash.new
      @js_directories_by_virtual_prefix = ActiveSupport::OrderedHash.new
    end

    def call(env)
      request = Http::Request.new(env)
      if physical_path = convert_virtual_path_to_physical_path(request.path_info) 
        if File.exist?(physical_path)
          return response_with_file_contents(physical_path)
        end
      end
      proxied_app.call(env)
    end

    def response_with_file_contents(physical_path)
      file = Rack::File.new(nil)
      file.path = physical_path
      file.serving
    end

    def add_js_directory(physical_prefix, virtual_prefix)
      js_directories_by_physical_prefix[physical_prefix] = virtual_prefix
      js_directories_by_virtual_prefix[virtual_prefix] = physical_prefix
    end

    def dependency_paths(*source_files)
      secretary = Sprockets::Secretary.new(
        :load_path    => js_directories_by_physical_prefix.keys,
        :source_files => source_files
      )
      secretary.preprocessor.dependency_ordered_source_files.map {|source_file| convert_physical_path_to_virtual_path(source_file.pathname.absolute_location)}
    end

    protected
    def convert_virtual_path_to_physical_path(virtual_path)
      js_directories_by_virtual_prefix.each do |virtual_prefix, physical_prefix|
        return virtual_path.gsub(virtual_prefix, physical_prefix) if virtual_path.starts_with?(virtual_prefix)
      end
      nil
    end

    def convert_physical_path_to_virtual_path(physical_path)
      js_directories_by_physical_prefix.each do |physical_prefix, virtual_prefix|
        return physical_path.gsub(physical_prefix, virtual_prefix) if physical_path.starts_with?(physical_prefix)
      end
      raise "Cannot convert physical path to virtual path. No registered physical prefixes match path: #{physical_path}."
    end
  end
end

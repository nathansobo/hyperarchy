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

      delegate :call, :add_js_directory, :virtualized_dependency_paths, :to => :instance
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
      js_directories_by_virtual_prefix.each do |virtual_prefix, physical_prefix|
        if request.path_info.starts_with?(virtual_prefix)
          physical_path = request.path_info.gsub(virtual_prefix, physical_prefix)
          if File.exist?(physical_path)
            return response_with_file_contents(physical_path)
          end
        end
      end
      proxied_app.call(env)
    end

    def response_with_file_contents(physical_path)
      body = File.read(physical_path)
      [200, {
        "Last-Modified"  => File.mtime(physical_path).httpdate,
        "Content-Type"   => Rack::Mime.mime_type(File.extname(physical_path), 'text/plain'),
        "Content-Length" => Rack::Utils.bytesize(body)
      }, body]
    end

    def add_js_directory(physical_prefix, virtual_prefix)
      js_directories_by_physical_prefix[physical_prefix] = virtual_prefix
      js_directories_by_virtual_prefix[virtual_prefix] = physical_prefix
    end

    def virtualized_dependency_paths(*source_files)
      secretary = Sprockets::Secretary.new(
        :load_path    => js_directories_by_physical_prefix.keys,
        :source_files => source_files
      )
      secretary.preprocessor.dependency_ordered_source_files.map {|source_file| convert_to_physical_prefix_to_virtual_prefix(source_file.pathname.absolute_location)}
    end

    def convert_to_physical_prefix_to_virtual_prefix(absolute_path)
      js_directories_by_physical_prefix.each do |absolute_prefix, virtual_prefix|
        return absolute_path.gsub(absolute_prefix, virtual_prefix) if absolute_path.starts_with?(absolute_prefix)
      end
    end
  end
end

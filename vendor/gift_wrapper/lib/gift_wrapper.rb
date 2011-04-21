dir = File.dirname(__FILE__)
require "digest/sha1"
require "yaml"
require "fileutils"
require "#{dir}/gift_wrapper/location"
require "#{dir}/gift_wrapper/js_file"
require "#{dir}/gift_wrapper/require_context"

class GiftWrapper
  attr_reader :load_path, :package_dir
  attr_accessor :app, :development_mode

  class << self
    def new(app, development_mode=nil)
      instance.app = app
      instance.development_mode = development_mode unless development_mode.nil?
      instance
    end

    def instance
      return @instance if @instance
      @instance = allocate
      @instance.send(:initialize)
      @instance
    end

    def method_missing(method, *args, &block)
      instance.send(method, *args, &block)
    end

    def clear_instance
      @instance = nil
    end
  end

  def initialize
    @load_path = []
  end

  def mount(physical_path_prefix, web_path_prefix)
    physical_path_prefix = physical_path_prefix.to_s
    web_path_prefix = web_path_prefix.to_s
    
    location = Location.new(self, physical_path_prefix, web_path_prefix)
    load_path.push(location)
    location
  end

  def mount_package_dir(physical_path_prefix, web_path_prefix="/pkg")
    FileUtils.mkdir_p(physical_path_prefix) unless File.directory?(physical_path_prefix)
    @package_dir = mount(physical_path_prefix, web_path_prefix)
  end

  def clear_package_dir
    if Dir["#{package_dir.physical_path}/*"].length > 0
      system("rm #{package_dir.physical_path}/*")
    end
  end

  def require_js(*paths)
    if development_mode
      context = RequireContext.new(false)
      walk_require_graph(paths, context)
      context.required_web_paths
    else
      raise "Package dir not assigned" unless package_dir
      digest = metadata[paths]
      raise "Javascript has not been combined for paths #{paths.inspect}" unless digest
      [package_dir.resolve_from_load_path("minified.#{digest}.js").web_path]
    end
  end

  def combine_js(*paths)
    require "fileutils"

    raise "Package dir not assigned" unless package_dir
    context = RequireContext.new(true)
    walk_require_graph(paths, context)

    digest = Digest::SHA1.hexdigest(context.combined_content)

    combined_path = "#{package_dir.physical_path}/combined.#{digest}.js"
    minified_path = "#{package_dir.physical_path}/minified.#{digest}.js"

    File.open(combined_path, "w") do |file|
      file.write(context.combined_content)
    end

    minify(combined_path, minified_path)
    FileUtils.rm(combined_path)

    metadata[paths] = digest

    write_metadata
    digest
  end

  def call(env)
    web_path = env['PATH_INFO']
    location = resolve_web_path(web_path)

    if location && location.file?
      location.rack_response
    else
      app.call(env)
    end
  end

  def resolve_web_path(web_path_to_resolve)
    most_specific_location =
      load_path.
      sort_by {|location| location.web_path.length}.
      reverse.
      find {|location| location.matches_web_path(web_path_to_resolve)}

    most_specific_location.resolve_web_path(web_path_to_resolve) if most_specific_location
  end

  def resolve_physical_path(physical_path_to_resolve)
    most_specific_location =
      load_path.
      sort_by {|location| location.physical_path.length}.
      reverse.
      find {|location| location.matches_physical_path(physical_path_to_resolve)}

    most_specific_location.resolve_physical_path(physical_path_to_resolve) if most_specific_location
  end

  def resolve_from_load_path(path_to_resolve)
    load_path.each do |location|
      if js_file = location.resolve_from_load_path(path_to_resolve)
        return js_file
      end
    end
    raise "File #{path_to_resolve} not found on load path"
  end

  def metadata
    return @metadata if @metadata
    read_metadata
  end

  protected

  def read_metadata
    if File.exist?(metadata_path)
      @metadata = YAML.load_file(metadata_path)
    else
      @metadata = {}
    end
  end

  def write_metadata
    File.open(metadata_path, "w") do |file|
      YAML.dump(metadata, file)
    end
  end

  def metadata_path
    "#{package_dir.physical_path}/gift_wrapper.yml"
  end

  def walk_require_graph(paths, context)
    paths.each do |path|
      js_file = resolve_from_load_path("#{path}.js")
      js_file.expand_require_graph(context)
    end
  end

  def minify(input_path, output_path)
    IO.popen("java -jar #{compiler_jar_path} --js #{input_path} --js_output_file #{output_path} --warning_level=QUIET") do |f|
      puts line while line = f.gets
    end
    raise "Error running closure compiler" unless $?.to_i == 0
  end

  def compiler_jar_path
    "#{File.dirname(__FILE__)}/../bin/compiler.jar"
  end

  ActiveSupport.run_load_hooks(:gift_wrapper, self) if defined? ActiveSupport
end


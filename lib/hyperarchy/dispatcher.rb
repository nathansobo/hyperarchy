class Dispatcher
  class << self
    def instance(*args)
      @instance ||= new(*args)
    end

    protected :new
  end

  attr_reader :root, :public_directory
  def initialize
    @root = Resources::Root.new
    @public_directory = Rack::Directory.new("#{File.dirname(__FILE__)}/../../public")
  end

  def call(env)
    # This is here so a new all.js gets generated on each request. It would probably be better to not concatenate in development
    Server.compile_public_assets

    request = Rack::Request.new(env)
    if resource = locate_resource(request.path_info)
      resource.send(request.request_method.downcase, request.params)
    else
      public_directory.call(env)
    end
  rescue Exception => e
    puts e.message
    puts e.backtrace
  end

  def locate_resource(path)
    res = path_parts(path).inject(root) do |resource, child_resource_name|
      if resource
        resource.locate(child_resource_name)
      else
        nil
      end
    end
  end

  def path_parts(path)
    path.split('/').reject { |part| part == "" }
  end
end

module Http
  class Dispatcher
    class << self
      def instance(*args)
        @instance ||= new(*args)
      end

      protected :new
    end

    attr_reader :root
    def initialize
      @root = Resources::Root.new
    end

    def call(env)
      request = Rack::Request.new(env)
      locate_resource(request.path_info).send(request.request_method.downcase, request.params)
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
end
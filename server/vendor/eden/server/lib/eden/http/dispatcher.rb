module Http
  class Dispatcher
    class << self
      def instance(*args)
        @instance ||= new(*args)
      end

      protected :new
    end

    def root
      @root ||= Resources::Root.new 
    end

    def call(env)
      Model::Repository.initialize_identity_maps
      request = Request.new(env)
      result = locate_resource(request.path_info, request.session_id).send(request.method, request.params)
      Model::Repository.clear_identity_maps
      result
    end

    def locate_resource(path, session_id)
      root.current_session_id = session_id
      path_parts(path).inject(root) do |resource, child_resource_name|
        if resource
          next_resource = resource.locate(child_resource_name)
          raise "no subresource named #{child_resource_name}" unless next_resource
          next_resource.current_session_id = session_id
          next_resource
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

module Util
  class ResourceLocator
    attr_reader :root

    def new_root_resource
      Resources::Root.new
    end

    def locate(request, comet_client)
      path = request.path_info
      session_id = request.session_id

      root = new_root_resource
      root.current_request = request
      root.current_comet_client = comet_client
      path_parts(path).inject(root) do |resource, child_resource_name|
        if resource
          next_resource = resource.locate(child_resource_name)
          raise "no subresource named #{child_resource_name}" unless next_resource
          next_resource.current_request = request
          next_resource.current_comet_client = comet_client
          next_resource
        else
          nil
        end
      end
    end

    protected
    def path_parts(path)
      path.split('/').reject { |part| part == "" }
    end
  end
end

module Util
  class ResourceLocator
    attr_reader :root

    def root
      @root ||= Resources::Root.new
    end

    def locate(path, session_id)
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

    protected
    def path_parts(path)
      path.split('/').reject { |part| part == "" }
    end
  end
end
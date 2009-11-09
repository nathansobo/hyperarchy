module Http
  class Dispatcher
    attr_reader :resource_locator
    def initialize(resource_locator)
      @resource_locator = resource_locator
    end

    def call(env)
      Model::Repository.initialize_identity_maps
      request = Request.new(env)
      result = resource_locator.locate(request.path_info, :session_id => request.session_id).send(request.method, request.params)
      Model::Repository.clear_identity_maps
      result
    end
  end
end

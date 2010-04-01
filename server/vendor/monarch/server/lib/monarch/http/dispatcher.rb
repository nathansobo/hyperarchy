module Http
  class Dispatcher
    attr_reader :resource_locator
    def initialize(resource_locator)
      @resource_locator = resource_locator
    end

    def call(env)
      Model::Repository.with_local_identity_map do
        request = Request.new(env)
#        comet_client = CometHub.instance.find_or_build_comet_client(request.params.delete(:comet_client_id))
#        resource_locator.locate(request, comet_client).send(request.method, request.params)
        resource_locator.locate(request, nil).send(request.method, request.params)
      end
    end
  end
end

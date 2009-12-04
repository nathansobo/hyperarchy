module Http
  class Dispatcher
    attr_reader :resource_locator, :comet_hub
    def initialize(resource_locator)
      @resource_locator = resource_locator
      @comet_hub = CometHub.new
    end

    def call(env)
      Model::Repository.with_local_identity_map do
        request = Request.new(env)
        return comet_hub.call(request) if request.path_info =~ /\/comet.*/
        resource_locator.locate(request.path_info, :session_id => request.session_id).send(request.method, request.params)
      end
    end
  end
end

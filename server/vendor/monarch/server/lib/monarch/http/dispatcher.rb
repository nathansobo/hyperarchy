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


        if request.path_info =~ /\/comet.*/
          comet_hub.call(request)
        else
          comet_client = comet_hub.find_or_build(request.params.delete(:comet_client_id))
          resource_locator.locate(request.path_info, :session_id => request.session_id, :comet_client => comet_client).send(request.method, request.params)
        end
      end
    end
  end
end

module Http
  class Dispatcher
    attr_reader :resource_locator, :pusher, :channel, :comet_hub
    def initialize(resource_locator)
      @resource_locator = resource_locator
      @channel = Pusher::Channel::InMemory.new
      @pusher = Pusher::App.new(:channel => channel)
      @comet_hub = CometHub.new
    end

    def call(env)
      on_start unless @started
      Model::Repository.with_local_identity_map do
        request = Request.new(env)
        return comet_hub.call(request) if request.path_info =~ /\/comet.*/
        resource_locator.locate(request.path_info, :session_id => request.session_id).send(request.method, request.params)
      end
    end

    protected
    def on_start
      @started = true
#      EM.add_periodic_timer(3) { channel.publish("foo", "HI!") }
    end
  end
end

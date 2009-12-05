require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Dispatcher do
    attr_reader :dispatcher

    before do
      @dispatcher = Dispatcher.new(Util::ResourceLocator.new)
    end

    describe "#call" do
      after do
        RR.verify_doubles
      end


      context "when called with a path not beginning with /comet" do
        it "initializes the identity map, then locates a Resource with a session_id and CometClient and invokes the appropriate method thereupon, then clears the identity map" do
          request = TestRequest.new
          request.method = :get
          request.path_info = "/example/resource"
          request.session_id = "sample-session-id"
          request.env['QUERY_STRING'] = "comet_client_id=sample-comet-client-id&foo=bar"
          expected_comet_client = dispatcher.comet_hub.find_or_build("sample-comet-client-id")

          mock_resource = Object.new

          mock(Model::Repository.instance).initialize_local_identity_map.ordered
          mock(dispatcher.resource_locator).locate(request.path_info, :session_id => request.session_id, :comet_client => expected_comet_client).ordered { mock_resource }
          mock(mock_resource).get(:foo => 'bar').ordered
          mock(Model::Repository.instance).clear_local_identity_map.ordered

          dispatcher.call(request.env)
        end
      end
    end
  end
end

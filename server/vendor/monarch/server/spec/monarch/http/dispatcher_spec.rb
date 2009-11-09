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

      it "initializes identity maps, locates and invokes the appropriate HTTP method on a Resource, then clears identity maps and returns the result of that invocation" do
        request = TestRequest.new
        request.method = :get
        request.path_info = "/example/resource"
        request.session_id = "sample-session-id"
        mock_resource = Object.new

        mock(Model::Repository).initialize_identity_maps.ordered
        mock(dispatcher.resource_locator).locate(request.path_info, :session_id => request.session_id).ordered { mock_resource }
        mock(mock_resource).get(request.params).ordered
        mock(Model::Repository).clear_identity_maps.ordered

        dispatcher.call(request.env)
      end
    end
  end
end

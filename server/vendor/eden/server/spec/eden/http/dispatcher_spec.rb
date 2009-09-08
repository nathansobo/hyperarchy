require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Http
  describe Dispatcher do
    attr_reader :dispatcher

    before do
      @dispatcher = Dispatcher.instance
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
        mock(dispatcher).locate_resource(request.path_info, request.session_id).ordered { mock_resource }
        mock(mock_resource).get(request.params).ordered
        mock(Model::Repository).clear_identity_maps.ordered

        dispatcher.call(request.env)
      end
    end

    describe "#locate_resource" do
      it "starting with #root, successively calls #locate on resources with each fragment of the given path, assigning #current_session_id on each" do
        mock_root = Object.new
        resource_1 = Object.new
        resource_2 = Object.new

        session_id = 'sample-session_id'

        stub(dispatcher).root { mock_root }
        mock(mock_root).current_session_id=(session_id)
        mock(mock_root).locate('resource_1') { resource_1 }
        mock(resource_1).current_session_id=(session_id)
        mock(resource_1).locate('resource_2') { resource_2 }
        mock(resource_2).current_session_id=(session_id)

        dispatcher.locate_resource("/resource_1/resource_2", session_id).should == resource_2
      end
    end
  end
end

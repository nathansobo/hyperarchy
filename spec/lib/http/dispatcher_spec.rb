require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Http
  describe Dispatcher do
    attr_reader :dispatcher

    before do
      @dispatcher = Dispatcher.instance
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
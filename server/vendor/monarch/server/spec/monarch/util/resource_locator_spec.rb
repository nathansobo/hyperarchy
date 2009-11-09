require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Util
  describe ResourceLocator do
    attr_reader :resource_locator
    before do
      @resource_locator = ResourceLocator.new
    end

    describe "#locate" do
      it "starting with #root, successively calls #locate on resources with each fragment of the given path, assigning #current_session_id on each" do
        mock_root = Object.new
        resource_1 = Object.new
        resource_2 = Object.new

        session_id = 'sample-session_id'

        stub(resource_locator).root { mock_root }
        mock(mock_root).current_session_id=(session_id)
        mock(mock_root).locate('resource_1') { resource_1 }
        mock(resource_1).current_session_id=(session_id)
        mock(resource_1).locate('resource_2') { resource_2 }
        mock(resource_2).current_session_id=(session_id)

        resource_locator.locate("/resource_1/resource_2", session_id).should == resource_2
      end
    end

  end
end

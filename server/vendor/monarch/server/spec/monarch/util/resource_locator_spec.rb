require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Util
  describe ResourceLocator do
    attr_reader :resource_locator
    before do
      @resource_locator = ResourceLocator.new
    end

    describe "#locate" do

      it "starting with #root, successively calls #locate on resources with each fragment of the given requests's #path_info, assigning the #current_request and #current_client on each" do
        mock_root = Object.new
        resource_1 = Object.new
        resource_2 = Object.new

        session_id = 'sample-session_id'
        client = Object.new

        request = Http::TestRequest.new
        request.path_info = "/resource_1/resource_2"
        request.session_id = session_id

        stub(resource_locator).new_root_resource { mock_root }
        mock(mock_root).current_request=(request)
        mock(mock_root).current_comet_client=(client)
        mock(mock_root).locate('resource_1') { resource_1 }
        mock(resource_1).current_request=(request)
        mock(resource_1).current_comet_client=(client)
        mock(resource_1).locate('resource_2') { resource_2 }
        mock(resource_2).current_request=(request)
        mock(resource_2).current_comet_client=(client)

        resource_locator.locate(request, client).should == resource_2
      end
    end
  end
end

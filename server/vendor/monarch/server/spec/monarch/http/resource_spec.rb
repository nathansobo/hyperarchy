require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Resource do
    describe "#current_session" do
      attr_reader :session, :resource

      before do
        @session = Session.create
        @resource = Resource.new
        resource.current_request = Http::TestRequest.new
        resource.current_request.session_id = session.session_id
      end

      it "returns the Session with an id of #current_request's session_id" do
        resource.current_session.should == session
      end
    end
  end
end

require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Resource do
    describe "#current_session" do
      attr_reader :session, :resource

      before do
        @session = Session.create
        @resource = Resource.new
      end

      it "returns the Session with an id of #current_session_id" do
        resource.current_session_id = session.session_id
        resource.current_session.should == session
      end
    end
  end
end

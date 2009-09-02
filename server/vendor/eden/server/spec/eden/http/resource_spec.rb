require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Http
  describe Resource do
    describe "#current_session" do
      it "returns the Session with an id of #current_session_id" do
        resource = Resource.new
        session = Session.create
        resource.current_session_id = session.id
        resource.current_session.should == session
      end
    end
  end
end

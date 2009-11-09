require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Resource do
    describe "#current_session" do
      attr_reader :session, :resource

      before do
        @session = Session.create
        @resource = Resource.new
      end

      context "when a current_session_id has been assigned" do
        it "returns the Session with an id of #current_session_id" do
          resource.current_session_id = session.session_id
          resource.current_session.should == session
        end
      end
      
      context "when a current_client has been assigned" do
        it "returns the Session associated with that client" do
          client = Client.create(:session_id => session.session_id)
          resource.current_client = client

          resource.current_session.should == session
        end
      end
    end
  end
end

require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe SessioningService do
    describe "#call" do
      attr_reader :app, :sessioning_service, :incoming_request, :forwarded_request

      before do
        @app = lambda do |env|
          @forwarded_request = Request.new(env)
          [200, {}, "test"]
        end
        @sessioning_service = SessioningService.new(app)
        @incoming_request = TestRequest.new
      end

      context "when no '_session_id' cookie is present in the request" do
        it "creates a new Session, registers an XMPP user for the session, sets #session_id in the forwarded request, and adds a 'Set-Cookie' header to the response" do
          incoming_request.cookies['_session_id'].should be_nil

          mock.proxy(Session).create do |session|
            session.session_id = "fake-session-id"
            session
          end

          mock(sessioning_service).register_xmpp_user("fake-session-id@hyperarchy.org", "fake-session-id")

          response = Response.new(*sessioning_service.call(incoming_request.env))
          forwarded_request.session_id.should == "fake-session-id"
          response.cookies['_session_id'].should == "fake-session-id"
        end
      end

      context "when a '_session_id' cookie is present in the request" do
        it "sets #session_id in the forwarded request withoun creating a new Session or registering an XMPP user, and does not add a 'Set-Cookie' header to the response" do
          incoming_request.cookies['_session_id'] = "sample-session-id"

          dont_allow(Session).create
          dont_allow(sessioning_service).register_xmpp_user
          response = Response.new(*sessioning_service.call(incoming_request.env))
          forwarded_request.session_id.should == incoming_request.cookies['_session_id']
          response.cookies['_session_id'].should be_nil
        end
      end
    end
  end
end

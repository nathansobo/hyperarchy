require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

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

      context "when no 'session_id' cookie is present in the request" do
        it "creates a new Session, sets #session_id in the forwarded request, and adds a 'Set-Cookie' header to the response" do
          incoming_request.cookies['session_id'].should be_nil

          session_id = nil
          mock.proxy(Session).create do |session|
            session_id = session.id
            session
          end

          response = Response.new(*sessioning_service.call(incoming_request.env))
          forwarded_request.session_id.should == session_id
          response.cookies['session_id'].should == session_id
        end
      end

      context "when a 'session_id' cookie is present in the request" do
        it "sets #session_id in the forwarded request withoun creating a new Session, and does not add a 'Set-Cookie' header to the response" do
          incoming_request.cookies['session_id'] = "sample-session-id"

          dont_allow(Session).create
          response = Response.new(*sessioning_service.call(incoming_request.env))
          forwarded_request.session_id.should == incoming_request.cookies['session_id']
          response.cookies['session_id'].should be_nil
        end
      end
    end
  end
end

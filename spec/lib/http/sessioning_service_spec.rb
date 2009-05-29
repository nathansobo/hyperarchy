require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Http
  describe SessioningService do
    describe "#call" do
      attr_reader :app, :sessioning_service

      before do
        @app = Object.new
        @sessioning_service = SessioningService.new(app)
      end

      context "when no 'session_id' cookie is present in the request" do
        it "creates a new Session and sets the 'session_id' cookie in the response to its id" do
          request = TestRequest.new
          request.cookies['session_id'].should be_nil

          mock(app).call(request.env) { [200, {}, "test body"] }
          session_id = nil
          mock.proxy(Session).create do |session|
            session_id = session.id
            session
          end

          response = Response.new(*sessioning_service.call(request.env))
          response.cookies['session_id'].should == session_id
        end
      end

      context "when a 'session_id' cookie is present in the request" do
        it "does not create a new Session" do
          request = TestRequest.new
          request.cookies['session_id'] = Guid.new

          mock(app).call(request.env) { [200, {}, "test body"] }
          dont_allow(Session).create

          sessioning_service.call(request.env)
        end
      end
    end
  end
end
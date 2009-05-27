module Http
  class SessioningService
    attr_accessor :app

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Rack::Request.new(env)
      session_id = request.cookies["rack.session"] || Session.create.id
      status, headers, body = app.call(env)
      response = Rack::Response.new(body, status, headers)
      response.set_cookie("rack.session", :value => session_id)
      response.finish
    end
  end
end
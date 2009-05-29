module Http
  class SessioningService
    attr_accessor :app

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)
      session_id = request.cookies["session_id"] || Session.create.id


      response = Response.new(*app.call(env))
      response.cookies["session_id"] = session_id
      response.to_a
    end
  end
end
module Http
  class SessioningService
    attr_accessor :app

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)
      if request.cookies["session_id"]
        request.session_id = request.cookies["session_id"]
        app.call(request.env)
      else
        session_id = Session.create.id
        request.session_id = session_id
        response = Response.new(*app.call(request.env))
        response.cookies["session_id"] = session_id
        response.to_a
      end
    end
  end
end
module Http
  class SessioningService
    attr_accessor :app

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Request.new(env)
      if request.cookies["_session_id"]
        request.session_id = request.cookies["_session_id"]
        app.call(request.env)
      else
        session_id = Session.create.session_id
        register_xmpp_user("#{session_id}@hyperarchy.org", session_id)
        request.session_id = session_id
        response = Response.new(*app.call(request.env))
        response.cookies["_session_id"] = session_id
        response.to_a
      end
    end

    def register_xmpp_user(jid, password)
      xmpp_client = Jabber::Client.new(jid)
      xmpp_client.connect('localhost', 5222)
      xmpp_client.register(password)
      xmpp_client.close
    end
  end
end

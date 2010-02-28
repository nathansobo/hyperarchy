module Http
  class TestRequest < Http::Request
    def initialize(session_id = Session.create.session_id)
      super({ 'monarch.session_id' => session_id })
    end
  end
end
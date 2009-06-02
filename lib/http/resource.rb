module Http
  class Resource
    attr_accessor :current_session_id

    def current_session
      Session.find(current_session_id)
    end
  end
end
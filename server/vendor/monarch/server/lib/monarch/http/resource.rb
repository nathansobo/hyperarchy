module Http
  class Resource
    attr_accessor :current_comet_client, :current_session_id

    def current_session
      Session.find(Session[:session_id].eq(current_session_id))
    end

    def current_user
      current_session.user
    end

    #TODO: Test this directly
    def ajax_success(data)
      ajax_response(true, data)
    end

    def ajax_failure(data)
      ajax_response(false, data)
    end

    def ajax_response(successful, data)
      response = {
        "successful" => successful,
        "data" => data
      }
      [200, {}, response.to_json]
    end
  end
end

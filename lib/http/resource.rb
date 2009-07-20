module Http
  class Resource
    attr_accessor :current_session_id

    def current_session
      Session.find(current_session_id)
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
module Http
  class Resource
    attr_accessor :current_session_id

    def current_session
      Session.find(current_session_id)
    end

    #TODO: Test this directly
    def ajax_success(data)
      response = {
        "successful" => true,
        "data" => data
      }
      [200, {}, response.to_json]
    end
  end
end
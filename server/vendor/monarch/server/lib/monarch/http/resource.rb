module Http
  class Resource
    attr_accessor :current_comet_client, :current_request

    def current_session_id
      current_request.session_id
    end

    def current_session
      Session.find(Session[:session_id].eq(current_session_id))
    end

    def current_user
      current_session.user
    end

    def ajax_success(data, records_or_relations=nil)
      ajax_response(true, data, records_or_relations)
    end

    def ajax_failure(data, records_or_relations=nil)
      ajax_response(false, data, records_or_relations)
    end

    def ajax_response(successful, data, records_or_relations=nil)
      response_body = {
        "successful" => successful,
        "data" => data
      }
      response_body["records"] = build_relational_dataset(records_or_relations) if records_or_relations
      [200, {}, response_body.to_json]
    end

    def build_relational_dataset(records_or_relations)
      dataset = {}
      records_or_relations.each do |r|
        r.add_to_relational_dataset(dataset)
      end
      dataset
    end

  end
end

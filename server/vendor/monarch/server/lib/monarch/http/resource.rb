module Http
  class Resource
    include BuildRelationalDataset

    attr_accessor :current_comet_client, :current_request

    def current_session_id
      current_request.session_id
    end

    def current_user
      current_request.env['warden'].user
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
      }
      response_body["data"] = data if data
      response_body["dataset"] = build_relational_dataset(records_or_relations) if records_or_relations
      [200, {"Content-Type" => "application/json"}, response_body.to_json]
    end
  end
end

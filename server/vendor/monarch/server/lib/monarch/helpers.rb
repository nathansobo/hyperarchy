module Monarch
  module Helpers
    def successful_json_response(data, dataset=nil)
      json_response(true, data, dataset)
    end

    def unsuccessful_json_response(data, dataset=nil)
      json_response(false, data, dataset)
    end

    def json_response(successful, data, dataset=nil)
      headers("Content-Type" => "application/json")
      response = { "successful" => successful }
      response["data"] = data if data
      if dataset
        response["dataset"] = dataset.instance_of?(Hash) ? dataset : build_relational_dataset(dataset)
      end
      response.to_json
    end

    def exposed_repository
      @exposed_repository ||= Models::ExposedRepository.new(current_user)
    end

    def current_real_time_client
      request.env[Rack::RealTimeHub::RACK_ENV_CLIENT_KEY]
    end
  end
end
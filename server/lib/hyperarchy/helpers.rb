module Hyperarchy
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

    def current_user
      warden.user
    end

    def current_real_time_client
      request.env[Http::RealTimeHub::RACK_ENV_CLIENT_KEY]
    end

    def warden
      @warden ||= request.env['warden']
    end

    def render_page(template, params={})
      template.new(params.merge(:current_user => current_user)).to_pretty
    end
  end
end
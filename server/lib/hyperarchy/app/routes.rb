module Hyperarchy
  class App < Sinatra::Base
    get "/" do
      render_page Views::Root
    end

    post "/login" do
      warden.logout
      if user = warden.authenticate
        successful_json_response({ "current_user_id" => user.id }, user)
      else
        unsuccessful_json_response(
          :errors => {
            :email_address => warden.errors.on(:email_address),
            :password => warden.errors.on(:password)
          }
        )
      end
    end

    post "/signup" do
      new_user = User.create!(params)
      request.env['warden'].set_user(new_user)
      successful_json_response("current_user_id" => new_user.id)
    end

    get "/repository/fetch" do
      dataset = exposed_repository.fetch(params[:relations].from_json)
      successful_json_response(nil, dataset)
    end

    post "/repository/mutate" do
      successful, response_data = exposed_repository.mutate(params[:operations].from_json)
      json_response(successful, response_data)
    end

    post "/repository/subscribe" do
      successful, response_data = exposed_repository.subscribe(params[:relations].from_json)
      json_response(successful, response_data)
    end

    post "/response_data/unsubscribe" do
      successful = exposed_repository.unsubscribe(params[:subscription_ids].from_json)
      json_response(successful, "")
    end
  end
end
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
  end
end
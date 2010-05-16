module Hyperarchy
  class App < Sinatra::Base

    get "/" do
      render_page Views::Home, :flash => flash
    end

    get "/app" do
      render_page Views::App
    end

    post "/login" do
      warden.logout(:default)
      if warden.authenticate
        redirect "/app"
      else
        flash.errors = warden.errors.full_messages
        redirect "/#logIn"
      end
    end

    post "/signup" do
      new_user = User.create!(params)
      request.env['warden'].set_user(new_user)
      successful_json_response("current_user_id" => new_user.id)
    end
  end
end